const AWS = require("aws-sdk");

const textract = new AWS.Textract();

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { fileKey, bucketName } = body;

    if (!fileKey || !bucketName) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "fileKey and bucketName are required",
        }),
      };
    }

    const params = {
      DocumentLocation: {
        S3Object: {
          Bucket: bucketName,
          Name: fileKey,
        },
      },
      FeatureTypes: ["FORMS", "TABLES"],
    };

    const result = await textract.startDocumentAnalysis(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Textract analysis started",
        jobId: result.JobId,
        fileKey,
        bucketName,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to start Textract analysis",
        details: error.message,
      }),
    };
  }
};