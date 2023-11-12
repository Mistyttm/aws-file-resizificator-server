import * as AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { encodeVideo } from '@middleware/ffmpeg';
import { encodedVideoUrl, removeFiles } from '@middleware/validator';
import { bucketName, uploadToS3, getSignedUrl} from 'middleware/aws/s3Bucket';

/* Code adapted from AWS SQS documenation:
    https://docs.aws.amazon.com/code-library/latest/ug/sqs_example_sqs_CreateQueue_section.html
    https://docs.aws.amazon.com/code-library/latest/ug/sqs_example_sqs_DeadLetterQueue_section.html */

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: 'ap-southeast-2',
});

const sqs = new AWS.SQS();

/* Define queue parameters */
export const sourceQueueName = 'cab432_team1_sqs';
const sourceParams = { QueueName: sourceQueueName, Attributes: { 'DelaySeconds': '20', 'ReceiveMessageWaitTimeSeconds': '20', 'MessageRetentionPeriod': '1800' } }; // Retain message for 30 minutes
const dlqParams = { QueueName: 'cab432_team1_dlq', Attributes: { 'MessageRetentionPeriod': '14400' } }; // Retain messages for 4 hours

/* Initialise SQS source queue and dead letter queue + queue policies */
export async function initliseQueues() {
    const dlq = await createQueue(dlqParams);
    const sourceQueue = await createQueue(sourceParams);

    if (sourceQueue && dlq) {
        const deadLetterQueueArn = await getArn(dlq.QueueUrl);
        if (deadLetterQueueArn) {
            // @ts-ignore
            // Set the redrive policy between queues from source queue url and dead letter queue Amazon resource name
            await setRedrivePolicy(sourceQueue.QueueUrl, deadLetterQueueArn);
            
            // Start SQS worker to listen for messages
            // @ts-ignore
            sqsWorker(sourceQueue.QueueUrl);
        }
    }
}

/* Create SQS queue */
export async function createQueue(params: any) {
    try {
        const queue = await sqs.createQueue(params).promise();
        console.log('Created SQS queue at url: ', queue.QueueUrl);
        return queue;
    } catch (error) {
        console.error('Error creating queue: ', error);
    }
}

/* Get Amazon resource name of the dead letter queue */
export async function getArn(dlqUrl: any) {
    const params = { QueueUrl: dlqUrl, AttributeNames: ["QueueArn"] };

    try {
        const deadLetterQueueArn = await sqs.getQueueAttributes(params).promise();
        console.log("Dead letter queue ARN: ", deadLetterQueueArn.Attributes?.QueueArn);
        return deadLetterQueueArn.Attributes?.QueueArn;
    } catch (error) {
        console.error("Error retrieving queue ARN: ", error);
    }
}

/* Create a redrive policy */
export async function setRedrivePolicy(sourceQueueUrl: string, deadLetterQueueArn: any) {
    const policyParams = {
        Attributes: {
            RedrivePolicy: JSON.stringify({ deadLetterTargetArn: deadLetterQueueArn, maxReceiveCount: 5 })
            },
            QueueUrl: sourceQueueUrl
        };
        
    try {
        const setPolicy = await sqs.setQueueAttributes(policyParams).promise();
        console.log('Redrive policy set successfully');
    } catch (error) {
        console.error('Error setting redrive policy: ', error);
    }
}

/* Retrieve a queue url */
export async function getQueueUrl(queueName: string) {
    const params = { QueueName: queueName };

    try {
        const url = await sqs.getQueueUrl(params).promise();
        return url.QueueUrl;
    } catch (error) {
        console.error("Error fetching queue URL: ", error);
    }
}

/* Send data containing info for encoding tasks as messages to SQS source queue */
export async function sendMessage(task: any, queueUrl: string) {
    const params = { QueueUrl: queueUrl, MessageBody: JSON.stringify(task) };

    try {
        const message = await sqs.sendMessage(params).promise();
        return {status: "OK", message: message.MessageId};
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

async function receiveMessage(queueUrl: string) {
    const messageParams = { 
        QueueUrl: queueUrl,
        AttributeNames: ['ApproximateReceiveCount', 'SentTimestamp'],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: ['All'],
        WaitTimeSeconds: 20,
        VisibilityTimeout: 30 
    };

    try {
        const tasks = await sqs.receiveMessage(messageParams).promise();

        if (tasks.Messages) { // Check messages exist for attempting processing
            for (const task of tasks.Messages) {
                try {
                    await processMessage(task, queueUrl);
                } catch (error) {
                    console.error('Error processing tasks from message: ', error);
                }
            }
        }
    } catch (error) {
        console.error('Error receiving messages: ', error);
    }
}

async function processMessage(task: any, queueUrl: string) {
    console.log('Running task from message: ', task.MessageId);
    console.log('Number of times this message has been received: ', task.Attributes.ApproximateReceiveCount);

    const policyParams = { QueueUrl: queueUrl, AttributeNames: ['RedrivePolicy'] };
    const getPolicy = await sqs.getQueueAttributes(policyParams).promise(); 

    if (getPolicy.Attributes) {
        const redrivePolicy = JSON.parse(getPolicy.Attributes.RedrivePolicy);

        if (task.Attributes.ApproximateReceiveCount >= redrivePolicy.maxReceiveCount) {
            console.log(`Message ID ${task.MessageId} has reached maximum processing attempts and has been moved to the Dead Letter Queue.`);
            return;
        }
    } else {
        console.error('No redrive policy found ', Error);
    }
    const runTask = await processEncodingTasks(task);

    if (runTask) {
        // Get the url associated with the output name from the message
        // @ts-ignore
        encodedVideoUrl[runTask.outputName] = runTask.signedUrl;

        // Delete video files from disk storage and message from SQS queue after processing task
        await removeFiles(runTask.inputPath);
        await removeFiles(runTask.outputPath);

        const deleteParams = { QueueUrl: queueUrl, ReceiptHandle: runTask.receiptHandle };
        await sqs.deleteMessage(deleteParams).promise();
        console.log('Deleted task from queue.');
    }
}

/* Process tasks for video encoding from queue message */
async function processEncodingTasks(message: any) {
    try {
        const task = JSON.parse(message.Body);
        const encodedVideo = await encodeVideo(task.filePath, task.outputName, task.resolution, task.fileType);
        // @ts-ignore
        const outputFilePath = encodedVideo.outputFilePath;

        // Upload the encoded video to S3
        const fileStream = fs.createReadStream(outputFilePath);
        const s3Key = path.basename(outputFilePath);
        const uploadParams = {
            Bucket: bucketName,
            Key: s3Key,
            Body: fileStream,
            ContentType: task.fileType
        };
        await uploadToS3(uploadParams);

        // Generate signed S3 URL for encoded video
        const signedUrlParams = {
            Bucket: bucketName,
            Key: s3Key,
            Expires: 60 * 20 // Url is valid for 20 minutes
        };

        const signedUrl = await getSignedUrl(signedUrlParams);

        return {
            receiptHandle: message.ReceiptHandle,
            inputPath: task.filePath,
            outputPath: outputFilePath,
            signedUrl: signedUrl,
            outputName: task.outputName 
        };

    } catch (error) {
        console.error('Error processing message: ', error);
        return null;
    }
}

/* Function to listen for messages in SQS source queue to be processed */
export async function sqsWorker(queueUrl: string) {
    while (true) { // Run indefinitely
        try {
            await receiveMessage(queueUrl);
        } catch (error) {
            console.error('Error processing message: ', error);
        }
    }
}
