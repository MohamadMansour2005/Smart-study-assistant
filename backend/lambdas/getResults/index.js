const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const textract = new AWS.Textract();
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
  try {
    const jobId =
      event.queryStringParameters &&
      event.queryStringParameters.jobId;

    if (!jobId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "jobId is required"
        })
      };
    }

    const result = await textract.getDocumentAnalysis({
      JobId: jobId
    }).promise();

    const status = result.JobStatus;

    if (status !== "SUCCEEDED") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status
        })
      };
    }

    const blocks = result.Blocks || [];

    const lines = blocks
      .filter(block => block.BlockType === "LINE" && block.Text)
      .map(block => block.Text);
let text = lines.join("\n");

// Light OCR cleanup
text = text
  .replace(/[ÂâË¢»¶´¸¹°]+/g, "")          // remove common OCR junk symbols
  .replace(/[ \t]+/g, " ")               // normalize repeated spaces
  .replace(/\n\s*\n\s*\n+/g, "\n\n")     // collapse too many blank lines
  .replace(/ +\n/g, "\n")                // remove spaces before line breaks
  .trim();

    let summary = null;
    let summarizeResponse = null;

    if (process.env.SUMMARIZE_FUNCTION_NAME) {
      const summarizePayload = {
        body: JSON.stringify({ text })
      };

      summarizeResponse = await lambda.invoke({
        FunctionName: process.env.SUMMARIZE_FUNCTION_NAME,
        InvocationType: "RequestResponse",
        Payload: JSON.stringify(summarizePayload)
      }).promise();

      const parsedPayload = JSON.parse(summarizeResponse.Payload);

      if (parsedPayload.body) {
        const summarizeBody = JSON.parse(parsedPayload.body);
        summary = summarizeBody.summary || null;
      } else {
        summary = "No body returned from summarize lambda";
      }
    }

    const userId = "TEMP_USER";
    const documentId = Date.now().toString();

    if (TABLE_NAME) {
      await dynamo.put({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `DOC#${documentId}`,
          fileName: "uploaded-document.pdf",
          text,
          summary,
          createdAt: new Date().toISOString()
        }
      }).promise();
    }
return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify({
    status,
    text,
    summary
  })
};

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};