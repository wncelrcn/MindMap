export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { journal_text } = req.body;
  if (!journal_text) {
    return res.status(400).json({ message: "Journal text is required" });
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

  const prompt = `
    You are a helpful therapist that analyzes journal entries and provides a summary of the user's mood and thoughts.
    The journal entry is:
    ${journalString}
    Please provide a concise summary of the user's mood and thoughts.

    Use second person view.
    Use "The Journal is about" in your response.
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
    `;

  // Try Gemini first
  try {
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
    const geminiSummary =
      geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (geminiSummary) {
      return res
        .status(200)
        .json({ summary: geminiSummary, source: "gemini", raw: geminiResult });
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
              content: prompt,
            },
            {
              role: "user",
              content: `The journal entry is:\n${journalString}\nPlease provide a concise summary of the user's mood and thoughts.`,
            },
          ],
          max_tokens: 128,
        }),
      }
    );

    const openRouterResult = await openRouterResponse.json();
    const openRouterSummary =
      openRouterResult?.choices?.[0]?.message?.content?.trim();

    if (openRouterSummary) {
      return res.status(200).json({
        summary: openRouterSummary,
        source: "openrouter",
        raw: openRouterResult,
      });
    }

    // If both fail
    return res.status(500).json({
      message: "Both Gemini and OpenRouter failed to generate a summary.",
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Failed to generate summary" });
  }
}
