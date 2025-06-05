export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { history, lastText } = req.body;
  if (!history) {
    return res.status(400).json({ error: "No history provided" });
  }

  // Check if API key exists
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const systemPrompt = `You are a helpful therapist. Based on the conversation history provided, generate a new, deeper follow-up question to help the user reflect further.

The question should be a single sentence that is a question.
The question should be related to the user's journaling text.
The question should be not too long or too short.
The question should be not too complex or too simple.
The question should be not too personal or too public.
The question should be not too vague or too specific.
The question should be thoughtful and encourage self-reflection.

Do not include markdown formatting in the question.
Do not include any other text in the question.

Please generate a single, thoughtful follow-up question.`;

  try {
    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-8b-instruct:free",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `Conversation so far:\n${history}\n\nLatest text: ${
                lastText || ""
              }`,
            },
          ],
          max_tokens: 256,
          temperature: 0.7,
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();

      // Handle rate limit specifically
      if (openRouterResponse.status === 429) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message:
            "You've reached the daily limit for free requests. Please try again later or add credits to your OpenRouter account.",
          details: errorText,
        });
      }

      return res.status(500).json({
        error: "OpenRouter API error",
        status: openRouterResponse.status,
        details: errorText,
      });
    }

    const openRouterResult = await openRouterResponse.json();
    const openRouterQuestion =
      openRouterResult?.choices?.[0]?.message?.content?.trim();

    if (openRouterQuestion) {
      return res.status(200).json({
        question: openRouterQuestion,
        source: "openrouter",
      });
    }

    // If OpenRouter fails
    return res.status(500).json({
      error: "Failed to generate question from OpenRouter.",
      details: openRouterResult,
    });
  } catch (error) {
    console.error("Error generating question:", error);
    res.status(500).json({
      error: "Failed to generate question",
      message: error.message,
    });
  }
}
