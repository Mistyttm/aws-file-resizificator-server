import * as AWS from 'aws-sdk';
import fs from 'fs';

// Code sourced from week 7 s3 demonstration 
AWS.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    sessionToken: process.env.aws_session_token,
    region: "ap-southeast-2",
});

// Create an S3 client
const s3 = new AWS.S3();

const bucketName = "cab432-team1-bucket";
const objectKey = "data.json";

// JSON data to be written to S3
let bucketData = {
    video: null,
    thumbnail: null
};

export async function createS3bucket() {
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
export async function uploadJsonToS3() {
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

// Note: Include .mp4 extension in videoName param
export async function uploadVideoToS3(filePath: any, videoName: any) {
    const file = fs.createReadStream(filePath);
    const params = {
        Bucket: bucketName,
        Key: videoName,
        Body: file,
        ContentType: 'video/mp4'
    };

    try {
        await s3.upload(params).promise();
        console.log("Video uploaded to S3 successfully.");
        bucketData.video = videoName;
        await uploadJsonToS3();
    } catch (error) {
        console.error("Error uploading video to S3: ", error);
    }
}

// Retrieve the object from S3
export async function getObjectFromS3() {
    const params = {
        Bucket: bucketName,
        Key: objectKey,
    };

    try {
        const data = await s3.getObject(params).promise();

        // Parse JSON content
        const parsedData = JSON.parse(data.Body?.toString('utf-8') || '{}');
        console.log('Parsed JSON data:', parsedData);
        bucketData = parsedData; 
    } catch (error) {
        console.error('Error:', error);
    }
}
