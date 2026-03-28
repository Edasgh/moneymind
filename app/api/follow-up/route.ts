import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini_apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_apiKey!!);

export async function POST(req: Request) {
  const { history } = await req.json();

  const chatHistory = history
    .map((m: any) => `${m.type === "user" ? "User" : "AI"}: ${m.text}`)
    .join("\n");

    const systemPrompt = `
        You are MoneyMind — an AI behavioral finance coach.

        Your role:
        - Continue conversations like a real human coach
        - Understand emotions behind spending habits
        - Ask thoughtful, relevant follow-up questions

        TASK:
        - Ask ONLY ONE follow-up question
        - Make it personal to the user's situation
        - Focus on behavior, triggers, or patterns
        - Keep it short (one sentence)

        STYLE:
        - Conversational and natural
        - Slightly empathetic but curious
        - Use simple language
        - You may use 1 emoji (not more)

        STRICT OUTPUT RULES:
        - Output ONLY the question
        - No explanations before or after
        - No markdown
        - No bullet points
        - No headings (#)
        - No code blocks
        - No bold or italic formatting
        - No multiple questions

        If the output contains formatting, rewrite it into plain text before responding.

        GOOD EXAMPLE:
        "What usually triggers this spending — stress or boredom? 🤔"

        BAD EXAMPLES:
        "# What triggers this?"
        "- What triggers this?"
        "Here is your question: What triggers this?"

        Always return a clean, single-line question.`;

   const prompt = `
    ${chatHistory}

    Ask a follow-up question.
    `;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction:systemPrompt
  });

  const result = await model.generateContent(prompt);
  const text = result.response
    .text()
    .replace(/[*#`>-]/g, "") // remove markdown symbols
    .replace(/\n{2,}/g, "\n")
    .trim();
    
  return Response.json({ question: text });
}
