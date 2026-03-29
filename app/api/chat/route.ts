import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 🧠 SYSTEM PROMPT (Conversational Mode)
   const systemPrompt = `
    You are MoneyMind — a sharp, human-like AI behavioral finance coach.

    GOAL:
    Help users fix money habits by identifying the real behavioral trigger behind their actions.

    HOW YOU THINK:
    - Don’t just respond — diagnose
    - Always look for the hidden pattern (impulse, stress, boredom, social pressure, dopamine, avoidance)

    RESPONSE FLOW (IMPORTANT):
    1. Start with a direct observation (not generic empathy)
    2. Name the behavior clearly (be slightly bold)
    3. Give 1 specific, realistic fix (₹, limits, rules, habit tweak)
    4. End with a short question that makes them reflect

    TONE:
    - Crisp, conversational, and human
    - Slightly bold honesty (call things out, but don’t judge)
    - Feels like a smart friend, not a therapist
    - No fluff, no over-explaining
    - Indian context when relevant (₹, UPI, Swiggy, Zomato, Amazon)

    STYLE RULES:
    - Max 2–3 sentences (strict)
    - Short and punchy lines
    - Avoid filler phrases like:
      "I understand", "It's important to", "You should consider"
    - Use at most 1 emoji (optional)

    BEHAVIOR RULES:
    - If it's impulse → call it out directly
    - If it's emotional → acknowledge briefly, then redirect
    - If repeated → point it out clearly
    - If vague → ask a sharp follow-up

    STRICT OUTPUT:
    - Plain text only
    - No markdown
    - No lists
    - No headings
    - No formatting symbols
    - No explanations outside the reply

    GOOD EXAMPLE:
    "This looks like impulse spending, not a real need. Try setting a ₹300 weekly cap for Swiggy and stick to it. What usually triggers these orders — boredom or stress?"

    BAD EXAMPLE:
    "I understand your concern. You should try budgeting better."

    Always sound natural, sharp, and a bit bold.
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
