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
export const sourceQueueName = "cab432_team1_sqs";
const sourceParams = { QueueName: sourceQueueName, Attributes: { "DelaySeconds": "20", "ReceiveMessageWaitTimeSeconds": "20", "MessageRetentionPeriod": "1800" } }; // Retain message for 30 minutes
const dlqParams = { QueueName: "cab432_team1_dlq", Attributes: { "MessageRetentionPeriod": "14400" } }; // Retain messages for 4 hours

/* Function to create source and dead letter queues + setup dlq redrive policy */
export async function initliseQueues() {
    const dlq = await createQueue(dlqParams);
    const sourceQueue = await createQueue(sourceParams);

    if (sourceQueue && dlq) {
        const deadLetterQueueArn = await getArn(dlq.QueueUrl);
        if (deadLetterQueueArn) {
            // @ts-ignore
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
        console.log("SQS Queue Created: ", queue.QueueUrl);
        return queue;
    } catch (error) {
        console.error("Error creating queue: ", error);
    }
}

/* Retreieve Amazon Resource Name of the dead letter queue */
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

/* Set redrive policy for dead letter queue */
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

/* Retrieve queue url */
export async function getQueueUrl(queueName: string) {
    const params = { QueueName: queueName };

    try {
        const url = await sqs.getQueueUrl(params).promise();
        return url.QueueUrl;
    } catch (error) {
        console.error("Error fetching queue URL: ", error);
    }
}

/* Send video encoding tasks as messages to SQS queue */
export async function sendMessage(task: any, queueUrl: string) {
    const params = { QueueUrl: queueUrl, MessageBody: JSON.stringify(task) };

    try {
        const message = await sqs.sendMessage(params).promise();
        return {status: "OK", message: message.MessageId};
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

export async function runTasks(message: any) {
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
    }
}

/* Receive tasks from SQS message and process tasks */
export async function processTasks(queueUrl: any) {
    const params = { AttributeNames: ["SentTimestamp"],  MaxNumberOfMessages: 10,  MessageAttributeNames: ["All"],
                        QueueUrl: queueUrl, WaitTimeSeconds: 20, VisibilityTimeout: 30 };

    try {
        const tasks = await sqs.receiveMessage(params).promise();

        if (tasks.Messages) {
            console.log("Recieved tasks!");
            for (const task of tasks.Messages) {
                try {
                    const processTaskQueue = await runTasks(task);
                    if (processTaskQueue != null) {
                        // Delete message from SQS queue after processing task
                        const deleteParams = { QueueUrl: queueUrl, ReceiptHandle: processTaskQueue };
                        await sqs.deleteMessage(deleteParams).promise();
                        console.log("Deleted task from queue.");
                    } else {
                        console.error("Error processing task.");
                    }
                } catch (error) {
                    console.error("Error processing tasks from message: ", error);
                }
            }
        }
    } catch (error) {
        console.error("Error processing tasks: ", error);
    }
}

/* SQS worker to listen for messages to be processed */
export async function sqsWorker(queueUrl: string) {
    while (true) { // Run indefinitely
        try {
            await processTasks(queueUrl);
            // Check for new tasks in message queue every 20 seconds
            await new Promise(resolve => setTimeout(resolve, 20000));
        } catch (error) {
            console.error("Error processing message: ", error);
            await new Promise(resolve => setTimeout(resolve, 40000));
        }
    }
}
