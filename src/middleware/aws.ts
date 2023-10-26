import * as AWS from 'aws-sdk';

// Code sourced from week 7 s3 demonstration 
AWS.config.update({
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
    sessionToken: process.env.aws_session_token,
    region: "ap-southeast-2",
});

// Create an S3 client
const s3 = new AWS.S3();

const bucketName = process.env.BUCKET_NAME ?? "cab432-team1-bucket";

export async function createS3bucket() {
    try {
        await s3.createBucket({ Bucket: bucketName }).promise();
        console.log(`Created bucket: ${bucketName}`);
    } catch (error: any) {
        if (error.statusCode === 409) {
            console.log(`Bucket already exists: ${bucketName}`);
        } else {
            console.log(`Error creating bucket: ${error}`);
        }
    }
}

// Upload data to S3
export async function uploadToS3(fileName: string, data: any, fileType: any) {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: data,
        ContentType: fileType,
    };

    try {
        await s3.putObject(params).promise();
        console.log('File uploaded successfully.');
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}


// Get a signed URL
export async function getSignedUrl(filename: string) {
    const params = {
        Bucket: bucketName,
        Key: filename,
        Expires: 3600 // 1 hour expiry
    };

    return s3.getSignedUrl('getObject', params);
}
