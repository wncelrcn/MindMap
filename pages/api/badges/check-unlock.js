import { createClient } from "@/utils/supabase/server-props";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Debug function to check RLS configuration
async function debugRLSConfiguration(supabase, userUID) {
  const debug = {
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    userUID,
    queries: {},
  };

  try {
    // Test regular client queries
    const { data: userData, error: userError } = await supabase
      .from("user_table")
      .select("user_UID")
      .eq("user_UID", userUID)
      .single();

    debug.queries.user_table = {
      success: !userError,
      error: userError?.message,
    };

    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("user_UID")
      .eq("user_UID", userUID)
      .single();

    debug.queries.user_stats = {
      success: !statsError,
      error: statsError?.message,
    };

    const { data: badgesData, error: badgesError } = await supabase
      .from("badges")
      .select("badge_id")
      .limit(1);

    debug.queries.badges = {
      success: !badgesError,
      error: badgesError?.message,
    };

    const { data: userBadgesData, error: userBadgesError } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_UID", userUID)
      .limit(1);

    debug.queries.user_badges = {
      success: !userBadgesError,
      error: userBadgesError?.message,
    };
  } catch (error) {
    debug.generalError = error.message;
  }

  return debug;
}

// Helper function to count words in a journal entry answer
function countWordsInAnswer(answerText) {
  if (!answerText || typeof answerText !== "string") {
    return 0;
  }

  // Clean the text: remove extra whitespace, newlines, tabs
  const cleanText = answerText
    .trim()
    .replace(/[\n\r\t]+/g, " ") // Replace newlines/tabs with spaces
    .replace(/\s+/g, " "); // Replace multiple spaces with single space

  if (cleanText === "") {
    return 0;
  }

  // Split by spaces and count
  return cleanText.split(" ").length;
}

// Helper function to get max word count from journal entry JSONB
function getMaxWordCountFromEntry(journalEntry) {
  if (!journalEntry || !Array.isArray(journalEntry)) {
    return 0;
  }

  let maxWords = 0;

  for (const element of journalEntry) {
    if (element && element.answer) {
      const wordCount = countWordsInAnswer(element.answer);
      maxWords = Math.max(maxWords, wordCount);
    }
  }

  return maxWords;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let supabase;
  let userUID;

  try {
    supabase = createClient({ req, res });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return res
        .status(401)
        .json({ error: "Authentication failed", details: authError.message });
    }

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Ensure we have a valid session with authenticated role
    if (!user.role || user.role !== "authenticated") {
      console.error("User role invalid:", user.role);
      return res
        .status(403)
        .json({ error: "Access denied - authenticated users only" });
    }

    userUID = user.id;
    console.log("=== BADGE CHECK DEBUG START ===");
    console.log("User UID:", userUID);

    // Run RLS debug check
    const rlsDebug = await debugRLSConfiguration(supabase, userUID);
    console.log("RLS Debug Info:", JSON.stringify(rlsDebug, null, 2));

    // Check if user_stats exists for this user (using admin client to bypass RLS)
    let existingStats;
    try {
      const { data: statsData, error: statsCheckError } = await supabaseAdmin
        .from("user_stats")
        .select("*")
        .eq("user_UID", userUID)
        .single();

      if (statsCheckError && statsCheckError.code !== "PGRST116") {
        // Error other than "not found"
        console.error("Error checking user stats:", statsCheckError);
        throw new Error(
          `Failed to check user stats: ${statsCheckError.message}`
        );
      }

      existingStats = statsData;
    } catch (error) {
      console.error("Error in user stats check:", error);
      return res.status(500).json({
        error: "Failed to check user stats",
        details: error.message,
      });
    }

    // Create user_stats if it doesn't exist (using admin client to bypass RLS)
    if (!existingStats) {
      console.log("Creating user_stats entry for user...");
      try {
        const { error: createStatsError } = await supabaseAdmin
          .from("user_stats")
          .insert({
            user_UID: userUID,
            freeform_entries: 0,
            guided_entries: 0,
            total_entries: 0,
            current_streak: 0,
            all_time_high_streak: 0,
            theme_counts: {},
            category_counts: {},
            longest_entry_words: 0,
          });

        if (createStatsError) {
          console.error("Error creating user stats:", createStatsError);
          return res.status(500).json({
            error: "Failed to create user stats",
            details: createStatsError.message,
          });
        }
        console.log("User stats created successfully");
      } catch (error) {
        console.error("Exception creating user stats:", error);
        return res.status(500).json({
          error: "Failed to create user stats",
          details: error.message,
        });
      }
    } else {
      console.log("Existing user stats found:", existingStats);
    }

    // Update user stats using RPC with timeout and retry (using admin client to bypass RLS)
    console.log("Calling update_user_stats for user:", userUID);
    try {
      const { error: updateError } = await Promise.race([
        supabaseAdmin.rpc("update_user_stats", { p_user_uid: userUID }),
        new Promise(
          (_, reject) =>
            setTimeout(() => reject(new Error("RPC timeout")), 30000) // 30 second timeout
        ),
      ]);

      if (updateError) {
        console.error("Update error:", updateError);
        return res.status(500).json({
          error: "Failed to update user stats",
          details: updateError.message,
          code: updateError.code,
        });
      }
      console.log("update_user_stats completed successfully");
    } catch (error) {
      console.error("Exception in update_user_stats:", error);
      return res.status(500).json({
        error: "Failed to update user stats",
        details: error.message,
      });
    }

    // Get updated user stats (using admin client to bypass RLS)
    let userStats;
    try {
      const { data: statsData, error: statsError } = await supabaseAdmin
        .from("user_stats")
        .select("*")
        .eq("user_UID", userUID)
        .single();

      if (statsError) {
        console.error("Error fetching updated user stats:", statsError);
        return res.status(500).json({
          error: "Failed to fetch user stats",
          details: statsError.message,
        });
      }

      userStats = statsData;
      console.log("Updated user stats:", userStats);
    } catch (error) {
      console.error("Exception fetching user stats:", error);
      return res.status(500).json({
        error: "Failed to fetch user stats",
        details: error.message,
      });
    }

    // Get all badges (using admin client to bypass RLS)
    let allBadges;
    try {
      const { data: badgesData, error: badgesError } = await supabaseAdmin
        .from("badges")
        .select("*")
        .order("badge_id");

      if (badgesError) {
        console.error("Error fetching badges:", badgesError);
        return res.status(500).json({
          error: "Failed to fetch badges",
          details: badgesError.message,
        });
      }

      allBadges = badgesData || [];
      console.log("All available badges:", allBadges.length);
    } catch (error) {
      console.error("Exception fetching badges:", error);
      return res.status(500).json({
        error: "Failed to fetch badges",
        details: error.message,
      });
    }

    // Get already unlocked badges
    let unlockedBadges;
    try {
      const { data: unlockedData, error: unlockedError } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_UID", userUID);

      if (unlockedError) {
        console.error("Error fetching unlocked badges:", unlockedError);
        return res.status(500).json({
          error: "Failed to fetch unlocked badges",
          details: unlockedError.message,
        });
      }

      unlockedBadges = unlockedData || [];
      console.log("Already unlocked badges:", unlockedBadges);
    } catch (error) {
      console.error("Exception fetching unlocked badges:", error);
      return res.status(500).json({
        error: "Failed to fetch unlocked badges",
        details: error.message,
      });
    }

    const unlockedBadgeIds = new Set(unlockedBadges.map((b) => b.badge_id));
    const newlyUnlocked = [];
    const debugInfo = [];

    // Check each badge for unlock criteria
    for (const badge of allBadges) {
      console.log(
        `\n--- Checking badge: ${badge.name} (ID: ${badge.badge_id}) ---`
      );

      if (unlockedBadgeIds.has(badge.badge_id)) {
        console.log("Badge already unlocked, skipping");
        continue;
      }

      let shouldUnlock = false;
      let debugMessage = "";

      try {
        switch (badge.badge_type) {
          case "streak":
            shouldUnlock = userStats.current_streak >= badge.required_value;
            debugMessage = `Streak check: ${userStats.current_streak} >= ${badge.required_value} = ${shouldUnlock}`;
            break;

          case "count":
            shouldUnlock = userStats.total_entries >= badge.required_value;
            debugMessage = `Count check: ${userStats.total_entries} >= ${badge.required_value} = ${shouldUnlock}`;
            break;

          case "theme_specific":
            if (badge.required_themes && badge.required_themes.length > 0) {
              const themeId = badge.required_themes[0];
              const themeCount = userStats.theme_counts?.[themeId] || 0;
              shouldUnlock = themeCount >= badge.required_value;
              debugMessage = `Theme specific check: Theme ${themeId} count ${themeCount} >= ${badge.required_value} = ${shouldUnlock}`;
            } else {
              debugMessage =
                "Theme specific check: No required themes specified";
            }
            break;

          case "theme_variety":
            const uniqueThemes = Object.keys(
              userStats.theme_counts || {}
            ).length;
            shouldUnlock = uniqueThemes >= badge.required_value;
            debugMessage = `Theme variety check: ${uniqueThemes} unique themes >= ${badge.required_value} = ${shouldUnlock}`;
            break;

          case "theme_complete":
            if (badge.required_themes) {
              const requiredThemes = badge.required_themes;
              let completedThemes = 0;

              for (const themeId of requiredThemes) {
                try {
                  const { data: categories } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("theme_id", themeId);

                  if (categories && categories.length >= 2) {
                    const completedCategories = categories.filter(
                      (cat) => (userStats.category_counts?.[cat.id] || 0) > 0
                    ).length;

                    if (completedCategories >= 2) {
                      completedThemes++;
                    }
                  }
                } catch (error) {
                  console.error(`Error checking theme ${themeId}:`, error);
                }
              }
              shouldUnlock = completedThemes >= requiredThemes.length;
              debugMessage = `Theme complete check: ${completedThemes} completed themes >= ${requiredThemes.length} = ${shouldUnlock}`;
            } else {
              debugMessage =
                "Theme complete check: No required themes specified";
            }
            break;

          case "special":
            if (badge.name === "Inner Voyager") {
              // Use the updated user_stats value first
              console.log(
                `Inner Voyager check: user_stats.longest_entry_words = ${userStats.longest_entry_words}`
              );

              if (userStats.longest_entry_words >= 500) {
                shouldUnlock = true;
                debugMessage = `Inner Voyager check: user_stats shows ${userStats.longest_entry_words} words >= 500 = true`;
              } else {
                // Fallback: Double-check by querying freeform entries directly
                console.log("Double-checking freeform entries directly...");
                try {
                  const { data: longEntries, error: entriesError } =
                    await supabase
                      .from("freeform_journaling_table")
                      .select("journal_entry")
                      .eq("user_UID", userUID);

                  if (entriesError) {
                    console.error(
                      "Error fetching freeform entries:",
                      entriesError
                    );
                    debugMessage = `Inner Voyager check: Error fetching entries - ${entriesError.message}`;
                  } else if (longEntries && longEntries.length > 0) {
                    let maxWordCount = 0;

                    for (const entry of longEntries) {
                      const wordCount = getMaxWordCountFromEntry(
                        entry.journal_entry
                      );
                      maxWordCount = Math.max(maxWordCount, wordCount);

                      if (wordCount >= 500) {
                        shouldUnlock = true;
                        break;
                      }
                    }

                    debugMessage = `Inner Voyager check: Found ${longEntries.length} freeform entries, max word count = ${maxWordCount}, has 500+ word entry = ${shouldUnlock}`;
                  } else {
                    debugMessage =
                      "Inner Voyager check: No freeform entries found";
                  }
                } catch (error) {
                  console.error(
                    "Error in Inner Voyager fallback check:",
                    error
                  );
                  debugMessage = `Inner Voyager check: Error in fallback - ${error.message}`;
                }
              }
            }

            if (badge.name === "Reflection Star") {
              try {
                const { data: recentEntries } = await supabase
                  .from("guided_journaling_table")
                  .select("date_created, theme_id")
                  .eq("user_UID", userUID)
                  .order("date_created", { ascending: false })
                  .limit(10);

                if (recentEntries && recentEntries.length >= 3) {
                  const dateGroups = {};
                  recentEntries.forEach((entry) => {
                    const date = entry.date_created;
                    if (!dateGroups[date]) dateGroups[date] = new Set();
                    dateGroups[date].add(entry.theme_id);
                  });

                  const sortedDates = Object.keys(dateGroups).sort().reverse();
                  let foundConsecutive = false;

                  for (let i = 0; i <= sortedDates.length - 3; i++) {
                    const date1 = new Date(sortedDates[i]);
                    const date2 = new Date(sortedDates[i + 1]);
                    const date3 = new Date(sortedDates[i + 2]);

                    const dayDiff1 = (date1 - date2) / (1000 * 60 * 60 * 24);
                    const dayDiff2 = (date2 - date3) / (1000 * 60 * 60 * 24);

                    if (dayDiff1 === 1 && dayDiff2 === 1) {
                      const themes1 = Array.from(dateGroups[sortedDates[i]]);
                      const themes2 = Array.from(
                        dateGroups[sortedDates[i + 1]]
                      );
                      const themes3 = Array.from(
                        dateGroups[sortedDates[i + 2]]
                      );

                      const allThemes = new Set([
                        ...themes1,
                        ...themes2,
                        ...themes3,
                      ]);
                      if (allThemes.size >= 3) {
                        foundConsecutive = true;
                        break;
                      }
                    }
                  }
                  shouldUnlock = foundConsecutive;
                  debugMessage = `Reflection Star check: Found ${recentEntries.length} recent entries, consecutive 3-day with 3+ themes = ${foundConsecutive}`;
                } else {
                  debugMessage = `Reflection Star check: Only ${
                    recentEntries?.length || 0
                  } recent entries (need at least 3)`;
                }
              } catch (error) {
                console.error("Error in Reflection Star check:", error);
                debugMessage = `Reflection Star check: Error - ${error.message}`;
              }
            }
            break;

          default:
            debugMessage = `Unknown badge type: ${badge.badge_type}`;
        }
      } catch (error) {
        console.error(`Error checking badge ${badge.name}:`, error);
        debugMessage = `Error checking badge: ${error.message}`;
      }

      console.log(debugMessage);
      debugInfo.push({
        badge_name: badge.name,
        badge_type: badge.badge_type,
        required_value: badge.required_value,
        should_unlock: shouldUnlock,
        debug_message: debugMessage,
      });

      if (shouldUnlock) {
        console.log(`🎉 Attempting to unlock badge: ${badge.name}`);
        try {
          const { error: unlockError } = await supabase
            .from("user_badges")
            .insert({
              user_UID: userUID,
              badge_id: badge.badge_id,
            });

          if (!unlockError) {
            newlyUnlocked.push(badge);
            console.log(`✅ Successfully unlocked badge: ${badge.name}`);
          } else {
            console.error("❌ Error unlocking badge:", badge.name, unlockError);
          }
        } catch (error) {
          console.error("❌ Exception unlocking badge:", badge.name, error);
        }
      }
    }

    console.log("=== BADGE CHECK DEBUG END ===");

    res.status(200).json({
      success: true,
      newlyUnlocked,
      stats: userStats,
      debug: {
        userUID,
        totalBadges: allBadges.length,
        alreadyUnlocked: unlockedBadges.length,
        newlyUnlocked: newlyUnlocked.length,
        badgeChecks: debugInfo,
        rlsDebug,
      },
    });
  } catch (error) {
    console.error("Error in badge check:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      userUID: userUID || "unknown",
    });
  }
}
