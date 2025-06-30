import { createClient } from "@/utils/supabase/server-props";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient({ req, res });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Ensure we have a valid session with authenticated role
    if (!user.role || user.role !== "authenticated") {
      console.error("User role invalid:", user.role);
      return res
        .status(403)
        .json({ error: "Access denied - authenticated users only" });
    }

    const userUID = user.id;

    // Check if user exists in user_table
    const { data: userTableData, error: userTableError } = await supabase
      .from("user_table")
      .select("user_UID, email")
      .eq("user_UID", userUID)
      .single();

    if (userTableError) {
      console.error("User not found in user_table:", userTableError);
    }

    // Get user's unlocked badges with badge details
    const { data: userBadges, error: badgesError } = await supabase
      .from("user_badges")
      .select(
        `
        *,
        badges (
          name,
          description,
          criteria,
          color_effect,
          image_url
        )
      `
      )
      .eq("user_UID", userUID)
      .order("unlocked_at", { ascending: false });

    if (badgesError) {
      console.error("Error fetching user badges:", badgesError);
      return res.status(500).json({ error: "Failed to fetch user badges" });
    }

    // Get user stats (using admin client to bypass RLS)
    let userStats;
    const { data: statsData, error: statsError } = await supabaseAdmin
      .from("user_stats")
      .select("*")
      .eq("user_UID", userUID)
      .single();

    if (statsError) {
      console.error("Error fetching user stats:", statsError);

      // If no stats exist, create them
      if (statsError.code === "PGRST116") {
        const { error: createError } = await supabaseAdmin
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

        if (createError) {
          console.error("Error creating user stats:", createError);
          return res.status(500).json({ error: "Failed to create user stats" });
        }

        // Fetch the newly created stats
        const { data: newStats } = await supabaseAdmin
          .from("user_stats")
          .select("*")
          .eq("user_UID", userUID)
          .single();

        userStats = newStats;
      } else {
        return res.status(500).json({ error: "Failed to fetch user stats" });
      }
    } else {
      userStats = statsData;
    }

    // Additional debugging: Check journal entries
    const { data: freeformEntries, error: freeformError } = await supabase
      .from("freeform_journaling_table")
      .select("id, date_created, journal_entry")
      .eq("user_UID", userUID);

    const { data: guidedEntries, error: guidedError } = await supabase
      .from("guided_journaling_table")
      .select("id, date_created, theme_id")
      .eq("user_UID", userUID);

    // Check all available badges (using admin client to bypass RLS)
    const { data: allBadges, error: allBadgesError } = await supabaseAdmin
      .from("badges")
      .select("*")
      .order("badge_id");

    res.status(200).json({
      success: true,
      badges: userBadges || [],
      stats: userStats,
      debug: {
        userUID,
        userInUserTable: !!userTableData,
        freeformEntriesCount: freeformEntries?.length || 0,
        guidedEntriesCount: guidedEntries?.length || 0,
        totalAvailableBadges: allBadges?.length || 0,
        userBadgesCount: userBadges?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: error.stack,
    });
  }
}
