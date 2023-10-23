const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: 'ap-southeast-2',
});

// Create an SQS service object
const sqs = new AWS.SQS();

const params = {
  QueueName: "cab432_team1_sqs",
  Attributes: {
    "DelaySeconds": "30",
    "MessageRetentionPeriod": "86400"
  }
};

async function createSQSQueue() {
  try {
    const data = await sqs.createQueue(params).promise();
    console.log("Created sqs queue: ", params.QueueName);
    console.log("URL: ", data.QueueUrl);
  } catch (error: any) {
    console.log("Error creating queue: ", error);
  }
}

module.exports = { createSQSQueue };