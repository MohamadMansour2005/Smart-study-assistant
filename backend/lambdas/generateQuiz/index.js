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
Generate 6 multiple-choice quiz questions from the following study material.

Requirements:
- Each question must have exactly 4 choices
- Only 1 choice should be correct
- Keep questions clear and study-oriented
- Focus on important concepts, definitions, formulas, and key facts
- Return ONLY valid JSON
- Do not include markdown fences
- Use this exact format:

[
  {
    "question": "string",
    "choices": ["choice 1", "choice 2", "choice 3", "choice 4"],
    "correctAnswer": "exact text of the correct choice",
    "explanation": "string"
  }
]

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
        maxTokens: 1500,
        temperature: 0.3
      }
    });

    const response = await client.send(command);

    const outputText =
      response.output &&
      response.output.message &&
      response.output.message.content &&
      response.output.message.content[0] &&
      response.output.message.content[0].text
        ? response.output.message.content[0].text
        : "[]";

    let quizzes;
    try {
      quizzes = JSON.parse(outputText);
    } catch (parseError) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "Model did not return valid JSON",
          raw: outputText
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        quizzes
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
        error: "Failed to generate quizzes",
        details: error.message
      })
    };
  }
};