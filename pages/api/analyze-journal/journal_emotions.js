import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { journal_text } = req.body;
  if (!journal_text) {
    return res.status(400).json({ message: "Journal text is required" });
  }

  // Check if API keys exist
  if (!process.env.OPENROUTER_API_KEY) {
    return res
      .status(500)
      .json({ message: "OpenRouter API key not configured" });
  }

  // Process journal text the same way as journal_summary.js
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

  if (journalString.trim() === "") {
    return res
      .status(400)
      .json({ message: "Valid journal content is required" });
  }

  try {
    console.log("Analyzing emotions for journal entry...");

    // Step 1: Detect emotions using Hugging Face
    let emotionResponse;
    try {
      console.log("Calling Hugging Face API...");
      emotionResponse = await axios.post(
        "https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base",
        { inputs: journalString },
        {
          headers: {
            Authorization: `Bearer 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`,
          },
        }
      );
    } catch (error) {
      console.error("Hugging Face API error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return res.status(500).json({
        message: "Failed to analyze emotions",
        details: error.message,
      });
    }

    if (!emotionResponse.data || !Array.isArray(emotionResponse.data[0])) {
      console.error("Invalid Hugging Face response:", emotionResponse.data);
      return res.status(500).json({
        message: "Invalid response from emotion detection API",
      });
    }

    const rawEmotions = emotionResponse.data[0];

    // Step 2: Normalize the scores to percentages
    const totalScore = rawEmotions.reduce(
      (sum, emotion) => sum + emotion.score,
      0
    );
    const normalizedEmotions = rawEmotions.map((emotion) => ({
      label: emotion.label,
      score: emotion.score / totalScore, // Normalize to sum to 1
    }));

    // Step 3: Sort by score (highest first) and take top 5
    const topEmotions = normalizedEmotions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log(
      "Top emotions detected:",
      topEmotions.map((e) => `${e.label}: ${Math.round(e.score * 100)}%`)
    );

    // Step 4: Generate descriptions for each emotion using OpenRouter
    const emotionsWithDescriptions = [];

    for (const emotion of topEmotions) {
      const systemPrompt = `You are a helpful therapist that analyzes journal entries and explains why someone might be feeling a specific emotion.

Generate a 1-2 sentence explanation for why the user might be feeling "${emotion.label}" based on their journal entry.

Use second person ("you") in your response.
Be empathetic and specific to their journal content.
Do not use markdown formatting.
Do not include any other text in your response.`;

      try {
        console.log(
          `Generating description for ${emotion.label} (${Math.round(
            emotion.score * 100
          )}%)...`
        );

        const openRouterResponse = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
              model: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                {
                  role: "user",
                  content: `The journal entry is:\n${journalString}\n\nWhy might the user be feeling "${emotion.label}"?`,
                },
              ],
              max_tokens: 100,
              temperature: 0.7,
            }),
          }
        );

        if (!openRouterResponse.ok) {
          const errorText = await openRouterResponse.text();
          console.error(`OpenRouter API error for ${emotion.label}:`, {
            status: openRouterResponse.status,
            details: errorText,
          });

          // Use a fallback description if API fails
          emotionsWithDescriptions.push({
            label: emotion.label,
            score: emotion.score,
            desc: `You appear to be experiencing ${emotion.label} based on the themes and expressions in your journal entry.`,
          });
          continue;
        }

        const openRouterResult = await openRouterResponse.json();
        const description =
          openRouterResult?.choices?.[0]?.message?.content?.trim();

        emotionsWithDescriptions.push({
          label: emotion.label,
          score: emotion.score,
          desc:
            description ||
            `You appear to be experiencing ${emotion.label} based on the themes and expressions in your journal entry.`,
        });

        // Add a small delay between API calls to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(
          `Error generating description for ${emotion.label}:`,
          error.message
        );

        // Use fallback description
        emotionsWithDescriptions.push({
          label: emotion.label,
          score: emotion.score,
          desc: `You appear to be experiencing ${emotion.label} based on the themes and expressions in your journal entry.`,
        });
      }
    }

    console.log(
      "Emotion analysis complete:",
      emotionsWithDescriptions.length,
      "emotions processed"
    );

    return res.status(200).json({
      success: true,
      emotions: emotionsWithDescriptions,
      source: "huggingface_openrouter",
    });
  } catch (error) {
    console.error("Error analyzing emotions:", error);
    res.status(500).json({
      message: "Failed to analyze emotions",
      error: error.message,
    });
  }
}
