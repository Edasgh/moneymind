import { GoogleGenerativeAI } from "@google/generative-ai";
const gemini_apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_apiKey!!);

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const systemPrompt = `
    You are MoneyMind, an elite AI behavioral finance coach.

    Specialization:
    - Human psychology with money
    - Identifying hidden spending patterns
    - Giving practical, realistic advice

    Rules:
    - Be sharp, insightful, and slightly bold
    - Avoid generic advice
    - Use Indian context (₹, UPI, Swiggy, Amazon, Flipkart)
    - Keep answers structured and concise
    - If brutal mode is on, be honest and slightly harsh but helpful
    - Use emojis to sound more human
    - Respond ONLY in JSON format — no explanations, no extra text, no markdown

    Always respond EXACTLY in this JSON format:

    {
      "personality": "<single-line personality insight, use harsh mode if enabled>",
      "insight": "<what the user is doing wrong>",
      "fix": "<3 simple actionable steps separated by \\n(DO NOT separate by 1,2 numbers or bullets or any symbols)>",
      "impact": "<what happens if they don’t improve>"
    }

    Notes:
    - Do NOT include extra text outside the JSON
    - Keep each field concise but meaningful
    - Use Indian examples where relevant
    `;
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContentStream(prompt);

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain",
      },
    },
  );
}
