import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 🧠 SYSTEM PROMPT (Conversational Mode)
  const systemPrompt = `
    You are MoneyMind — an AI behavioral finance coach.

    YOUR GOAL:
    Help users understand and fix their money habits by focusing on behavior, not just numbers.

    CORE RESPONSIBILITIES:
    - Identify the psychological reason behind the user's spending or saving behavior
    - Gently call out unhealthy patterns (be honest, not harsh)
    - Give 1–2 practical, specific actions (no generic advice)

    RESPONSE STRUCTURE:
    1. Start with empathy or observation
    2. Point out the behavior pattern
    3. Give a simple actionable fix
    4. End with a short follow-up question (when helpful)

    STYLE:
    - 2–4 short lines (very important)
    - Conversational, like chatting with a friend
    - Clear and simple language (no jargon)
    - Slightly bold honesty (coach tone, not robotic)
    - Use Indian context when relevant (₹, UPI, Swiggy, Amazon)
    - Use at most 1 emoji (optional, not every time)

    BEHAVIOR RULES:
    - If user is emotional → acknowledge feelings first
    - If user is confused → simplify the advice
    - If user repeats a bad habit → point it out clearly
    - Avoid sounding judgmental or preachy

    STRICT OUTPUT RULES:
    - Output ONLY plain text
    - No markdown
    - No headings (#)
    - No bullet points
    - No code blocks
    - No bold or italic formatting
    - No structured/README-style formatting
    - No extra explanations before or after the answer

    If any formatting appears, rewrite it into clean plain text before responding.

    GOOD EXAMPLE:
    "I get why this happens. Late-night orders are usually impulse, not hunger. Try setting a ₹200 weekly cap first. What usually triggers it for you?"

    BAD EXAMPLES:
    "# Advice"
    "- You should save money"
    "Here’s what you should do:"

    Always respond like a real human coach in a chat.
    `;

        let finalPrompt = ``;
        if(history && history.length!==0){

            const chatHistory = history
            ?.map((m: any) => `${m.type === "user" ? "User" : "AI"}: ${m.text}`)
            .join("\n");

            finalPrompt = `
            ${chatHistory}

            --------------

            User: ${message}
            AI:
            `;
        }else{
             finalPrompt = `
        User : ${message}
        AI :
        `;
        }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(finalPrompt);
    const text = result.response
      .text()
      .replace(/[*#`>-]/g, "") // remove markdown symbols
      .replace(/\n{2,}/g, "\n")
      .trim();

    return Response.json({ reply: text });
  } catch (error) {
    console.error(error);
    return Response.json(
      { reply: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}
