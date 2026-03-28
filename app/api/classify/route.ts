import { GoogleGenerativeAI } from "@google/generative-ai";
const gemini_apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_apiKey!!);

export async function POST(req: Request) {
  try {
    const { spending, problem, income } = await req.json();
   const systemPrompt = `
    You are MoneyMind, an elite AI financial assistant.

    Your job:
    - Classify user spending into one of three categories: essential, lifestyle, or impulsive.
    - Assign a financial behavior score out of 100, considering spending, problem awareness, and income.
    - Give realistic, concise, and India-context-aware guidance (₹, UPI, Swiggy, Amazon).

    Categories:
    1. essential – necessary expenses like rent, bills, groceries, medical
    2. lifestyle – discretionary but moderate spending like shopping, clothes, books, gym, travel, subscriptions
    3. impulsive – harmful or luxury spending like fast food, alcohol, gambling, party, luxury items

    Rules:
    - Consider **all three factors**: spending, problem, income.
    - Respond ONLY in JSON.
    - Score: 0–100 (higher is better financial behavior) Score SHOULD NOT EXCEED 100.
    - Do NOT include explanations, extra text, or markdown.
    - Normalize text (ignore capitalization/extra spaces).

    Example JSON output format:
    {
      "category": "<essential|lifestyle|impulsive>",
      "score": <0-100>
    }
    `;

  const prompt = `
  Classify the user's financial behavior based on the following data:

  Spending: ${spending}
  Problem: ${problem}
  Income: ${income}

  Return ONLY valid JSON in the exact format:
  {
    "category": "<essential|lifestyle|impulsive>",
    "score": <0-100>
  }
  Do NOT include explanations, markdown, or extra text.
  `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemPrompt,
    });

    // Direct generation (non-streaming)
    const result = await model.generateContent(prompt);

    let jsonOutput;
    try {
      // Clean output and parse JSON
      let text = result.response.text()?.trim();
      // 2️⃣ Remove markdown code blocks (```json ... ```) if present
      text = text.replace(/```json\s*|```/g, "").trim();

      // 3️⃣ Sometimes LLM adds extra text before/after JSON, extract {...} block
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in LLM output");

      const jsonString = match[0];
      jsonOutput = JSON.parse(jsonString);
      jsonOutput = {
        category: jsonOutput.category || "unknown",
        score: jsonOutput.score ?? 0,
      };
    } catch (e) {
      console.warn("Failed to parse LLM output, returning default JSON.", e);
      jsonOutput = { category: "unknown", score: 0 };
    }

    return new Response(JSON.stringify(jsonOutput), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to classify spending" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
