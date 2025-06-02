export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { history, lastText } = req.body;
  if (!history) {
    return res.status(400).json({ error: "No history provided" });
  }

  const prompt = `
    You are a helpful therapist. Here is the conversation so far between you and the user (in question/answer pairs). Based on the entire conversation, generate a new, deeper follow-up question to help the user reflect further.

    The question should be a single sentence that is a question.
    The question should be a question that is related to the user's journaling text.
    The question should be a question that is not too long or too short.
    The question should be a question that is not too complex or too simple.
    The question should be a question that is not too personal or too public.
    The question should be a question that is not too vague or too specific.
    The question should be a question that is not too leading or too leading.

    Do not include markdown formatting in the question.
    Do not include any other text in the question.

    Conversation so far:
    ${history}

    Please generate a single, thoughtful follow-up question.`;

  try {
    // Try Gemini first
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const geminiResult = await geminiResponse.json();
    const geminiQuestion =
      geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (geminiQuestion) {
      return res.status(200).json({
        question: geminiQuestion,
        source: "gemini",
        raw: geminiResult,
      });
    }

    // If Gemini fails, try OpenRouter
    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful therapist. Here is the conversation so far between you and the user (in question/answer pairs). Based on the entire conversation, generate a new, deeper follow-up question to help the user reflect further. Conversation so far: " +
                history +
                " Please generate a single, thoughtful follow-up question.",
            },
            {
              role: "user",
              content: lastText || "",
            },
          ],
          max_tokens: 64,
        }),
      }
    );

    const openRouterResult = await openRouterResponse.json();
    const openRouterQuestion =
      openRouterResult?.choices?.[0]?.message?.content?.trim();

    if (openRouterQuestion) {
      return res.status(200).json({
        question: openRouterQuestion,
        source: "openrouter",
        raw: openRouterResult,
      });
    }

    // If both fail
    return res.status(500).json({
      error: "Both Gemini and OpenRouter failed to generate a question.",
    });
  } catch (error) {
    console.error("Error generating question:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
}
