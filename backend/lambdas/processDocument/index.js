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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Document processing started",
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
        error: "Failed to process request",
        details: error.message,
      }),
    };
  }
};