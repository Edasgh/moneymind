import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
You are MoneyMind AI, a practical personal finance advisor.

Goals:
- Help users make smarter financial decisions
- Compare scenarios logically
- Give concise, actionable advice
- Adapt answers to the user's country

Focus on:
- affordability
- savings potential
- debt burden
- long-term stability
- inflation impact
- taxes and local banking realities
- purchasing power

Response Rules:
- Sound human and trustworthy
- Use simple language
- Be direct, not theoretical
- Mention:
  1. Best option
  2. Riskiest option
  3. Key trade-offs
  4. Final recommendation
  5. Risk level (Low / Medium / High)
- Mention assumptions briefly if data is incomplete
- Never guarantee profits or outcomes
- Keep replies under 120 words
- Avoid US-centric advice unless country is USA
`;

export async function explainScenario(results: any[], country: string) {
  const prompt = `
    User Country: ${country}

  Financial scenarios:
  ${JSON.stringify(results)}

  Analyze these options using ${country}'s financial conditions:
  - inflation
  - salary standards
  - living costs
  - taxes
  - loan interest rates
  - local purchasing power

  Return:
  - Best option + reason
  - Riskiest option + reason
  - Main trade-offs
  - Final recommendation
  - Overall risk comparison

  Keep it concise, practical, and beginner-friendly.
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
  });

  const res = await model.generateContent(prompt);

  return res.response.text();
}
