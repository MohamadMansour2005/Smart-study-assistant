const { TransformStream } = require("stream/web");
global.TransformStream = TransformStream;

if (!global.structuredClone) {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

const {
  BedrockRuntimeClient,
  ConverseCommand
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: "us-east-1"
});

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const text = body.text;

    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "text is required"
        })
      };
    }

 const prompt = `
The following text was extracted from lecture slides or study material using OCR.

Your task:
- Turn it into detailed study notes
- Preserve the order of topics
- Break the response into sections
- Explain each concept clearly

For every mathematical formula:
- Reconstruct the intended formula if OCR corrupted it
- Return formulas in proper LaTeX
- Use inline formulas inside \\( ... \\)
- Use standalone formulas inside \\[ ... \\]
- Define all variables used in formulas
- Explain what each formula means

For each section include:
1. Section heading
2. Explanation
3. Definitions
4. Important formulas (in LaTeX)
5. Key takeaways

Instructions:
- Do not give a short vague summary
- Produce detailed student study notes
- Ignore OCR noise where possible and infer intended meaning
- Preserve formulas carefully
- Prefer correctness of formulas over copying broken OCR text

Text:
${text}
`;

    const command = new ConverseCommand({
      modelId: "amazon.nova-micro-v1:0",
      messages: [
        {
          role: "user",
          content: [
            {
              text: prompt
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 1200,
        temperature: 0.3
      }
    });

    const response = await client.send(command);

    const summary =
      response.output &&
      response.output.message &&
      response.output.message.content &&
      response.output.message.content[0] &&
      response.output.message.content[0].text
        ? response.output.message.content[0].text
        : "No summary returned.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ summary })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Failed to summarize document",
        details: error.message
      })
    };
  }
};