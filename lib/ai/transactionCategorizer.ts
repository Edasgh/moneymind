import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// =========================
//  AI CATEGORY DETECTOR
// =========================
export async function detectBehaviorCategoryAI(category: string, type: string) {
  try {
    if (type === "Income") return "Income";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `
    Categorize this expense into ONLY ONE of:
    - Essential
    - Lifestyle
    - Impulsive

    Expense Category: "${category}"

    STRICT Rules:
    - Essential = bills, rent, groceries, transport, healthcare, education
    - Lifestyle = entertainment, dining, subscriptions, travel, hobbies
    - Impulsive = luxury, random shopping, late-night orders, unnecessary purchases

    Return ONLY one word.
    `;

    const result = await model.generateContent(prompt);

    const text = result.response.text().trim();

    const allowed = ["Essential", "Lifestyle", "Impulsive"];

    if (allowed.includes(text)) {
      return text;
    }

    // fallback if weird output
    return detectBehaviorCategoryFallback(category, type);
  } catch (error) {
    console.log("AI categorizer failed:", error);

    // fallback
    return detectBehaviorCategoryFallback(category, type);
  }
}

// =========================
//  FALLBACK RULE ENGINE
// =========================
function detectBehaviorCategoryFallback(category: string, type: string) {
  if (type === "Income") return "Income";

  const text = category.toLowerCase();

  const essentialKeywords = [
    "rent",
    "groceries",
    "food",
    "electricity",
    "water",
    "internet",
    "transport",
    "fuel",
    "medicine",
    "health",
    "education",
    "fees",
    "insurance",
    "emi",
    "loan",
  ];

  const lifestyleKeywords = [
    "movie",
    "travel",
    "netflix",
    "spotify",
    "restaurant",
    "vacation",
    "gym",
    "coffee",
    "subscription",
    "gaming",
    "shopping",
    "party",
  ];

  const impulsiveKeywords = [
    "amazon",
    "flipkart",
    "zomato",
    "swiggy",
    "luxury",
    "iphone",
    "gadgets",
    "late night",
    "random",
  ];

  if (essentialKeywords.some((k) => text.includes(k))) {
    return "Essential";
  }

  if (lifestyleKeywords.some((k) => text.includes(k))) {
    return "Lifestyle";
  }

  if (impulsiveKeywords.some((k) => text.includes(k))) {
    return "Impulsive";
  }

  return "Lifestyle";
}
