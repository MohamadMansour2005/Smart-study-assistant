const AWS = require("aws-sdk");

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

    const text = lines.join("\n");

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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status,
        text,
        summary,
        summarizeFunctionName: process.env.SUMMARIZE_FUNCTION_NAME || null,
        rawSummarizePayload: summarizeResponse ? summarizeResponse.Payload : null
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