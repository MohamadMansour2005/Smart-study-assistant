const AWS = require("aws-sdk");
const crypto = require("crypto");

const s3 = new AWS.S3();

exports.handler = async () => {
  try {
    const bucketName = process.env.UPLOADS_BUCKET_NAME;

    if (!bucketName) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "UPLOADS_BUCKET_NAME is not set" }),
      };
    }

    const fileKey = `uploads/${crypto.randomUUID()}.pdf`;

    const uploadUrl = s3.getSignedUrl("putObject", {
      Bucket: bucketName,
      Key: fileKey,
      Expires: 300,
      ContentType: "application/pdf",
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        uploadUrl,
        fileKey,
        bucketName,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to generate upload URL",
        details: error.message,
      }),
    };
  }
};