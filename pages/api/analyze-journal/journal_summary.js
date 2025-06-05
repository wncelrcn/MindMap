export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { journal_text } = req.body;
  if (!journal_text) {
    return res.status(400).json({ message: "Journal text is required" });
  }

  // Check if API key exists
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ message: "API key not configured" });
  }

  let journalString = "";
  if (Array.isArray(journal_text)) {
    journal_text.forEach((entry) => {
      if (entry.question && entry.answer) {
        journalString += `Q: ${entry.question}\nA: ${entry.answer}\n`;
      }
    });
  } else {
    journalString = String(journal_text);
  }

  const systemPrompt = `You are a helpful therapist that analyzes journal entries and provides a summary of the user's mood and thoughts.

Please provide a concise summary of the user's mood and thoughts.

Use second person view.
Use "The journal is about" in your response.
Use "you" in your response.

Do not call the user "the user".
Do not use "their" or "they" in your response.
Do not use "I" in your response.
Do not use "me" in your response.
Do not use "my" in your response.
Do not use "mine" in your response.
Do not use "myself" in your response.
Do not use "I'm" in your response.

Do not submit in markdown format.
Do not include any other text in your response.

Make sure that your response is within 120 words.`;

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
              content: `The journal entry is:\n${journalString}`,
            },
          ],
          max_tokens: 256,
          temperature: 0.7,
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      return res.status(500).json({
        message: "OpenRouter API error",
        status: openRouterResponse.status,
        details: errorText,
      });
    }

    const openRouterResult = await openRouterResponse.json();
    const openRouterSummary =
      openRouterResult?.choices?.[0]?.message?.content?.trim();

    if (openRouterSummary) {
      return res.status(200).json({
        summary: openRouterSummary,
        source: "openrouter",
      });
    }

    // If OpenRouter fails
    return res.status(500).json({
      message: "Failed to generate summary from OpenRouter.",
      details: openRouterResult,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({
      message: "Failed to generate summary",
      error: error.message,
    });
  }
}
