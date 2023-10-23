const AWS = require("aws-sdk");

// Code sourced from week 7 s3 demonstration 
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});

// Create an S3 client
const s3 = new AWS.S3();

const bucketName = "cab432-team1-bucket";
const objectKey = "data.json";

// JSON data to be written to S3
let bucketData = {
  thumbnail: null
};

async function createS3bucket() {
  try {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log("Created bucket: ", bucketName);
  } catch (error: any) {
    if (error.statusCode === 409) {
      console.log("Bucket already exists: ", bucketName);
    } else {
      console.log("Error creating bucket: ", error);
    }
  }
}

// Upload the JSON data to S3
async function uploadJsonToS3() {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Body: JSON.stringify(bucketData), // Convert JSON to string
    ContentType: 'application/json', // Set content type
  };

  try {
    await s3.putObject(params).promise();
    console.log("JSON file uploaded successfully.");
  } catch (error) {
    console.error("Error uploading JSON file: ", error);
  }
}

// Retrieve the object from S3
async function getObjectFromS3() {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const data = await s3.getObject(params).promise();

    // Parse JSON content
    const parsedData = JSON.parse(data.Body.toString('utf-8'));
    console.log('Parsed JSON data:', parsedData);
    bucketData = parsedData; 
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { bucketData, createS3bucket, uploadJsonToS3, getObjectFromS3 };