import createClient from "@/utils/supabase/api";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const supabase = createClient(req, res);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({
        message: "User not authenticated",
        details: authError?.message,
      });
    }

    const { data: journalData, dateRange, user_UID } = req.body;

    if (!dateRange || !user_UID) {
      return res.status(400).json({
        message: "Missing required data: dateRange and user_UID are required",
      });
    }

    // Handle case where no journals exist in the date range
    if (
      !journalData ||
      journalData.length === 0 ||
      (typeof journalData === "string" && journalData.trim() === "")
    ) {
      console.log("No journal entries found for the specified date range");
      return res.status(200).json({
        message: "No journal entries found for the specified date range",
        dateRange: dateRange,
        hasEntries: false,
      });
    }

    // Validate API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OpenRouter API key not configured");
      return res.status(500).json({
        message: "AI analysis service not configured",
        details: "Missing API key configuration",
      });
    }

    const prompt = `
Given the combined journal entries, please provide a summary of the user's journal.

Journal Data:
${journalData}

Please provide:
1. A concise summary of the user's mood and thoughts
2. The most appropriate mood and theme

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
  "mood": "list of your mood here (e.g. happy, sad, anxious, etc.)",
  "How You Have Been Feeling": "Describe your emotional and physical state based on the journal entries.",
  "What Might Be Contributing": "Summarize the main causes or triggers influencing how you’ve been feeling (in 3-4 sentences).",
  "Moments That Stood Out": "Summarize the most emotionally significant or memorable moments described in the journal entries (in 3-4 sentences).",
  "What Helped You Cope": "Mention the strategies, activities, or support systems that helped you manage your feelings (in 3-4 sentences).",
  "Remember": "Provide a gentle, personalized reminder or affirmation based on the journal (in 3-4 sentences)."
}
    `;

    let openRouterResponse;
    let openRouterResult;
    let openRouterContent;

    try {
      openRouterResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [{ role: "user", content: prompt }],
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

      openRouterResult = await openRouterResponse.json();
      openRouterContent =
        openRouterResult?.choices?.[0]?.message?.content?.trim();

      if (!openRouterContent) {
        throw new Error("No content received from OpenRouter API");
      }
    } catch (apiError) {
      console.error("OpenRouter API request failed:", apiError);
      return res.status(500).json({
        message: "Failed to connect to AI analysis service",
        details: apiError.message,
      });
    }

    console.log("AI Analysis Result:", openRouterContent);

    let cleanedContent = openRouterContent;
    if (cleanedContent.includes("```json")) {
      cleanedContent = cleanedContent
        .replace(/```json\s*/g, "")
        .replace(/```\s*$/g, "");
    } else if (cleanedContent.includes("```")) {
      cleanedContent = cleanedContent.replace(/```\s*/g, "");
    }

    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Original content:", openRouterContent);
      console.error("Cleaned content:", cleanedContent);
      return res.status(500).json({
        message: "Error parsing AI response",
        details: parseError.message,
        originalContent: openRouterContent,
        cleanedContent: cleanedContent,
      });
    }

    console.log(aiAnalysis);

    // Check for existing recap with better error handling
    let existingCheck;
    try {
      const { data, error: checkError } = await supabase
        .from("recap")
        .select("id")
        .eq("user_UID", user_UID)
        .eq("date_range_start", dateRange.startDate)
        .eq("date_range_end", dateRange.endDate)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(`Database check error: ${checkError.message}`);
      }

      existingCheck = data;
    } catch (dbError) {
      console.error("Error checking for existing recap:", dbError);
      return res.status(500).json({
        message: "Error checking for existing recap",
        details: dbError.message,
      });
    }

    if (existingCheck) {
      console.log("Recap already exists, skipping save");
      return res.status(200).json({
        message: "Recap already exists for this week",
        recap: existingCheck,
        skipped: true,
      });
    }

    // Save the recap with better error handling
    let savedRecap;
    try {
      const { data, error: saveError } = await supabase
        .from("recap")
        .insert({
          user_UID: user_UID,
          weekly_summary: aiAnalysis.summary,
          mood: aiAnalysis.mood,
          date_range_start: dateRange.startDate,
          date_range_end: dateRange.endDate,
          created_at: new Date().toISOString(),
          feeling: aiAnalysis["How You Have Been Feeling"],
          contributing: aiAnalysis["What Might Be Contributing"],
          moments: aiAnalysis["Moments That Stood Out"],
          cope: aiAnalysis["What Helped You Cope"],
          remember: aiAnalysis.Remember,
        })
        .select()
        .single();

      if (saveError) {
        throw new Error(`Database save error: ${saveError.message}`);
      }

      savedRecap = data;
    } catch (saveDbError) {
      console.error("Error saving recap:", saveDbError);
      return res.status(500).json({
        message: "Error saving recap to database",
        details: saveDbError.message,
      });
    }

    console.log("Recap saved successfully:", savedRecap);

    res.status(200).json({
      message: "Weekly recap analyzed and saved successfully",
      recap: savedRecap,
      aiAnalysis: aiAnalysis,
      dateRange: dateRange,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({
      message: "An unexpected error occurred",
      details: error.message,
    });
  }
}
