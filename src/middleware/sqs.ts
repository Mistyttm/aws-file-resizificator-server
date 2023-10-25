import * as AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    sessionToken: process.env.aws_session_token,
    region: 'ap-southeast-2',
    });
    
    // Create an SQS service object
    const sqs = new AWS.SQS();
    
    const params = {
        QueueName: "cab432_team1_sqs",
        Attributes: {
        "DelaySeconds": "30",
        "MessageRetentionPeriod": "900" // 15 minutes
        }
    };
    
export async function createSQSQueue() {
        try {
        const data = await sqs.createQueue(params).promise();
        console.log("Created sqs queue: ", params.QueueName);
        console.log("URL: ", data.QueueUrl);
        } catch (error: any) {
        console.log("Error creating queue: ", error);
        }
}
