import createClient from "@/utils/supabase/api";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Check if OpenRouter API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({ message: "OpenRouter API key not configured" });
    }

    // Create authenticated Supabase client
    const supabase = createClient(req, res);

    // Get the current authenticated user
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

    const user_UID = user.id;

    // Check user_stats table for existing personality data and updated_personality_at
    const { data: userStats, error: statsError } = await supabase
      .from("user_stats")
      .select(
        "user_personality_title, user_personality_desc, updated_personality_at"
      )
      .eq("user_UID", user_UID)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching user stats:", statsError);
      return res.status(500).json({
        message: "Error fetching user stats",
        details: statsError.message,
      });
    }

    // Calculate date one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateThreshold = oneWeekAgo.toISOString().split("T")[0];

    // Check if we need to regenerate personality data
    let needsUpdate = true;
    if (userStats && userStats.updated_personality_at) {
      const updatedAtDate = new Date(userStats.updated_personality_at);
      const weekAgoDate = new Date(oneWeekAgo);

      // If updated_personality_at is more recent than a week ago, use cached data
      if (updatedAtDate > weekAgoDate) {
        needsUpdate = false;

        // Return cached personality data if it exists
        if (
          userStats.user_personality_title &&
          userStats.user_personality_desc
        ) {
          return res.status(200).json({
            message: "Personality data retrieved from cache",
            personality: {
              title: userStats.user_personality_title,
              description: userStats.user_personality_desc,
            },
            lastUpdated: userStats.updated_personality_at,
            source: "cached",
          });
        } else {
          // If no personality data exists, force update
          needsUpdate = true;
        }
      }
    }

    // If we don't need to update, but no cached data exists, force update
    if (
      !needsUpdate &&
      (!userStats?.user_personality_title || !userStats?.user_personality_desc)
    ) {
      needsUpdate = true;
    }

    // Query freeform journaling table for entries from last week
    const { data: freeformData, error: freeformError } = await supabase
      .from("freeform_journaling_table")
      .select("journal_entry, title, date_created")
      .eq("user_UID", user_UID)
      .gte("date_created", dateThreshold)
      .order("date_created", { ascending: false });

    if (freeformError) {
      console.error("Error fetching freeform journals:", freeformError);
      return res.status(500).json({
        message: "Error fetching freeform journals",
        details: freeformError.message,
      });
    }

    // Query guided journaling table for entries from last week
    const { data: guidedData, error: guidedError } = await supabase
      .from("guided_journaling_table")
      .select("journal_entry, title, date_created")
      .eq("user_UID", user_UID)
      .gte("date_created", dateThreshold)
      .order("date_created", { ascending: false });

    if (guidedError) {
      console.error("Error fetching guided journals:", guidedError);
      return res.status(500).json({
        message: "Error fetching guided journals",
        details: guidedError.message,
      });
    }

    // Combine and process journal entries
    const allJournals = [
      ...(freeformData || []).map((entry) => ({
        ...entry,
        journal_type: "freeform",
      })),
      ...(guidedData || []).map((entry) => ({
        ...entry,
        journal_type: "guided",
      })),
    ];

    // Check if user has any journal entries from the last week
    if (allJournals.length === 0) {
      return res.status(200).json({
        message: "No journal entries found from the last week",
        personality: {
          title: "Emerging Journaler",
          description:
            "You're just beginning your journaling journey. As you write more entries, we'll be able to provide deeper insights into your personality patterns and traits. Keep writing to unlock your personality profile!",
        },
        entriesAnalyzed: 0,
        dateRange: {
          from: dateThreshold,
          to: new Date().toISOString().split("T")[0],
        },
      });
    }

    // Extract text content from journal entries
    let journalContent = "";
    allJournals.forEach((entry) => {
      if (entry.journal_type === "freeform") {
        // Handle freeform journal entries
        if (Array.isArray(entry.journal_entry)) {
          entry.journal_entry.forEach((item) => {
            if (item.question && item.answer) {
              journalContent += `${item.question}: ${item.answer}\n\n`;
            }
          });
        } else if (typeof entry.journal_entry === "string") {
          journalContent += `${entry.journal_entry}\n\n`;
        }
      } else if (entry.journal_type === "guided") {
        // Handle guided journal entries
        if (Array.isArray(entry.journal_entry)) {
          entry.journal_entry.forEach((item) => {
            if (item.question && item.answer) {
              journalContent += `${item.question}: ${item.answer}\n\n`;
            }
          });
        }
      }
    });

    // If no meaningful content found
    if (!journalContent.trim()) {
      return res.status(200).json({
        message: "No meaningful content found in journal entries",
        personality: {
          title: "Minimalist Reflector",
          description:
            "Your recent journal entries show a preference for brief, concise expression. This suggests you may be someone who values efficiency and directness in communication.",
        },
        entriesAnalyzed: allJournals.length,
        dateRange: {
          from: dateThreshold,
          to: new Date().toISOString().split("T")[0],
        },
      });
    }

    // Create system prompt for personality analysis
    const systemPrompt = `You are an expert personality analyst who specializes in identifying personality traits and patterns from journal entries. Your task is to analyze the user's journal entries from the past week and provide insights into their personality.

Based on the journal entries provided, identify the most prominent personality trait or characteristic that emerges from their writing patterns, emotional expressions, thought processes, and behavioral tendencies.

Please analyze for:
- Communication style and thought patterns
- Emotional processing and expression
- Values and priorities that emerge from their reflections
- Problem-solving approaches
- Relationship with self and others
- Growth mindset and adaptability
- Stress responses and coping mechanisms

Provide your analysis in the following JSON format ONLY:
{
  "title": "A 2-4 word personality title that captures their dominant trait (e.g., 'Thoughtful Optimist', 'Creative Problem-Solver', 'Empathetic Leader')",
  "description": "A 2-3 sentence description that explains this personality trait and how it manifests in their journal entries. Use second person ('you') and be encouraging and insightful."
}

Do not include any other text, formatting, or markdown. Focus on positive traits while being authentic to what the journal entries reveal.`;

    try {
      // Make request to OpenRouter API
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
                content: `Please analyze the following journal entries from the past week to identify the user's dominant personality trait:\n\n${journalContent}`,
              },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        }
      );

      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        console.error("OpenRouter API error:", {
          status: openRouterResponse.status,
          error: errorText,
        });

        // Save fallback personality data to user_stats table
        const fallbackTitle = "Reflective Journaler";
        const fallbackDescription =
          "You demonstrate a commitment to self-reflection and personal growth through your consistent journaling practice. Your willingness to explore your thoughts and emotions shows emotional intelligence and self-awareness.";
        const currentTimestamp = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("user_stats")
          .upsert({
            user_UID: user_UID,
            user_personality_title: fallbackTitle,
            user_personality_desc: fallbackDescription,
            updated_personality_at: currentTimestamp,
          });

        if (updateError) {
          console.error(
            "Error updating user stats with fallback personality data:",
            updateError
          );
        }

        // Return fallback personality analysis
        return res.status(200).json({
          message: "Personality analysis completed with fallback method",
          personality: {
            title: fallbackTitle,
            description: fallbackDescription,
          },
          entriesAnalyzed: allJournals.length,
          dateRange: {
            from: dateThreshold,
            to: new Date().toISOString().split("T")[0],
          },
          lastUpdated: currentTimestamp,
          source: "fallback",
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
          const personalityResult = JSON.parse(cleanedContent);

          // Validate the response structure
          if (!personalityResult.title || !personalityResult.description) {
            throw new Error("Invalid personality analysis structure");
          }

          // Save personality data to user_stats table
          const currentTimestamp = new Date().toISOString();
          const { error: updateError } = await supabase
            .from("user_stats")
            .upsert({
              user_UID: user_UID,
              user_personality_title: personalityResult.title,
              user_personality_desc: personalityResult.description,
              updated_personality_at: currentTimestamp,
            });

          if (updateError) {
            console.error(
              "Error updating user stats with personality data:",
              updateError
            );
            // Continue without failing the request
          }

          res.status(200).json({
            message: "Personality analysis completed successfully",
            personality: {
              title: personalityResult.title,
              description: personalityResult.description,
            },
            entriesAnalyzed: allJournals.length,
            dateRange: {
              from: dateThreshold,
              to: new Date().toISOString().split("T")[0],
            },
            lastUpdated: currentTimestamp,
            source: "openrouter",
          });
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          console.log("Original content:", openRouterContent);

          // Save parsing fallback personality data to user_stats table
          const parseTitle = "Introspective Writer";
          const parseDescription =
            "Your journal entries reveal a thoughtful and introspective nature. You take time to process your experiences and emotions, showing a deep commitment to personal understanding and growth.";
          const currentTimestamp = new Date().toISOString();

          const { error: updateError } = await supabase
            .from("user_stats")
            .upsert({
              user_UID: user_UID,
              user_personality_title: parseTitle,
              user_personality_desc: parseDescription,
              updated_personality_at: currentTimestamp,
            });

          if (updateError) {
            console.error(
              "Error updating user stats with parse fallback personality data:",
              updateError
            );
          }

          // Return fallback if parsing fails
          res.status(200).json({
            message: "Personality analysis completed with parsing fallback",
            personality: {
              title: parseTitle,
              description: parseDescription,
            },
            entriesAnalyzed: allJournals.length,
            dateRange: {
              from: dateThreshold,
              to: new Date().toISOString().split("T")[0],
            },
            lastUpdated: currentTimestamp,
            source: "fallback_parse_error",
          });
        }
      } else {
        // Save no content fallback personality data to user_stats table
        const noContentTitle = "Dedicated Reflector";
        const noContentDescription =
          "Your consistent journaling practice demonstrates dedication to self-improvement and emotional awareness. You value personal growth and aren't afraid to examine your thoughts and feelings honestly.";
        const currentTimestamp = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("user_stats")
          .upsert({
            user_UID: user_UID,
            user_personality_title: noContentTitle,
            user_personality_desc: noContentDescription,
            updated_personality_at: currentTimestamp,
          });

        if (updateError) {
          console.error(
            "Error updating user stats with no content fallback personality data:",
            updateError
          );
        }

        // If no content from OpenRouter
        res.status(200).json({
          message: "Personality analysis completed with content fallback",
          personality: {
            title: noContentTitle,
            description: noContentDescription,
          },
          entriesAnalyzed: allJournals.length,
          dateRange: {
            from: dateThreshold,
            to: new Date().toISOString().split("T")[0],
          },
          lastUpdated: currentTimestamp,
          source: "fallback_no_content",
        });
      }
    } catch (apiError) {
      console.error("OpenRouter API request failed:", apiError);

      // Save API error fallback personality data to user_stats table
      const apiErrorTitle = "Thoughtful Individual";
      const apiErrorDescription =
        "Based on your recent journaling activity, you show a strong inclination toward self-reflection and personal development. Your commitment to regular journaling suggests mindfulness and emotional intelligence.";
      const currentTimestamp = new Date().toISOString();

      const { error: updateError } = await supabase.from("user_stats").upsert({
        user_UID: user_UID,
        user_personality_title: apiErrorTitle,
        user_personality_desc: apiErrorDescription,
        updated_personality_at: currentTimestamp,
      });

      if (updateError) {
        console.error(
          "Error updating user stats with API error fallback personality data:",
          updateError
        );
      }

      // Return fallback personality analysis
      res.status(200).json({
        message: "Personality analysis completed with API fallback",
        personality: {
          title: apiErrorTitle,
          description: apiErrorDescription,
        },
        entriesAnalyzed: allJournals.length,
        dateRange: {
          from: dateThreshold,
          to: new Date().toISOString().split("T")[0],
        },
        lastUpdated: currentTimestamp,
        source: "fallback_api_error",
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      message: "An unexpected error occurred",
      details: error.message,
    });
  }
}
