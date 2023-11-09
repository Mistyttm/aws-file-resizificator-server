import * as AWS from 'aws-sdk';
import { encodeVideo } from '../ffmpeg';

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
        console.log("Redrive policy set successfully:", setPolicy);
    } catch (error) {
        console.error("Error setting redrive policy: ", error);
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

export async function processTasks(message: any) {
    console.log("Running task from message:", message.MessageId);
    // Retrieve the task parameteres from message in task queue
    const task = JSON.parse(message.Body);
    try {
        // Encode the video from the task passed in the message queue
        await encodeVideo(task.filePath, task.outputName, task.resolution, task.fileType);
        // Return confirmation reciept that the task has been handled
        return message.ReceiptHandle;
    } catch (error) {
        console.error('Error processing message: ', error);
        return null;
        // todo: retry sending message 
        // get message.ID
    }
}

/* Receive tasks from SQS message and process tasks */
export async function receiveMessage(queueUrl: any) {
    const params = { AttributeNames: ['SentTimestamp'],  MaxNumberOfMessages: 10,  MessageAttributeNames: ['All'],
                        QueueUrl: queueUrl, WaitTimeSeconds: 20, VisibilityTimeout: 30 };

    try {
        const tasks = await sqs.receiveMessage(params).promise();

        if (tasks.Messages) {
            console.log('Recieved tasks!');
            for (const task of tasks.Messages) {
                try {
                    const processTaskQueue = await processTasks(task);

                    // Delete message from SQS queue after processing task
                    const deleteParams = { QueueUrl: queueUrl, ReceiptHandle: processTaskQueue };
                    await sqs.deleteMessage(deleteParams).promise();
                    console.log('Deleted task from queue.');
                
                } catch (error) {
                    console.error('Error processing tasks from message: ', error);
                }
            }
        }
    } catch (error) {
        console.error("Error processing tasks: ", error);
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
