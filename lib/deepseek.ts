import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com",
});

export async function callDeepSeek(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.7
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature,
    max_tokens: 8192,
  });

  return response.choices[0].message.content || "";
}
