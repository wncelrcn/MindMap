const journalingThemes = [
  "Self-Reflection",
  "Goal Setting",
  "Gratitude",
  "Emotional Processing",
  "Daily Experiences",
  "Creativity",
  "Personal Growth",
  "Mental Health",
  "Mindfulness",
  "Memories",
  "Dream Journaling",
  "Travel",
  "Health and Wellness",
  "Relationships",
  "Career and Productivity",
  "Spirituality",
  "Affirmations",
  "Problem-Solving",
  "Nature and Environment",
  "Hobbies and Interests",
];

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

  const systemPrompt = `You are a helpful therapist that analyzes journal entries and provides a summary of the user's mood and thoughts, as well as identifies the main theme.

Please provide:
1. A concise summary of the user's mood and thoughts
2. The most appropriate theme from this list: ${journalingThemes.join(", ")}

For the summary:
- Use second person view
- Use "The journal is about" in your response
- Use "you" in your response
- Do not call the user "the user"
- Do not use "their" or "they" in your response
- Do not use "I" in your response
- Do not use "me" in your response
- Do not use "my" in your response
- Do not use "mine" in your response
- Do not use "myself" in your response
- Do not use "I'm" in your response

Format your response as JSON with this exact structure:
{
  "summary": "your summary here",
  "theme": "exact theme from the list"
}

Do not include any other text outside the JSON structure.`;

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
          model: "deepseek/deepseek-chat-v3-0324:free",
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
          max_tokens: 128,
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
    const openRouterContent =
      openRouterResult?.choices?.[0]?.message?.content?.trim();

    if (openRouterContent) {
      try {
        // Clean the response - remove markdown code blocks if present
        let cleanedContent = openRouterContent;
        if (cleanedContent.includes("```json")) {
          cleanedContent = cleanedContent
            .replace(/```json\s*/g, "")
            .replace(/\s*```/g, "");
        }
        if (cleanedContent.includes("```")) {
          cleanedContent = cleanedContent
            .replace(/```\s*/g, "")
            .replace(/\s*```/g, "");
        }

        // Parse the JSON response from the AI
        const parsedResult = JSON.parse(cleanedContent);

        // Validate that the theme is from our list
        const validTheme = journalingThemes.includes(parsedResult.theme)
          ? parsedResult.theme
          : "Self-Reflection"; // Default fallback

        console.log("Parsed result:", parsedResult);
        console.log("Valid theme:", validTheme);

        return res.status(200).json({
          summary: parsedResult.summary,
          theme: validTheme,
          source: "openrouter",
        });
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.log("Original content:", openRouterContent);

        // If JSON parsing fails, treat as legacy format (summary only)
        return res.status(200).json({
          summary: openRouterContent,
          theme: "Self-Reflection",
          source: "openrouter",
        });
      }
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
