import createClient from "@/utils/supabase/api";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
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

    // Query freeform emotions table for themes
    const { data: freeformData, error: freeformError } = await supabase
      .from("freeform_journal_emotions_table")
      .select("theme")
      .eq("user_UID", user_UID)
      .not("theme", "is", null);

    if (freeformError) {
      console.error("Error fetching freeform themes:", freeformError);
      // Don't return error immediately, continue with guided themes
    }

    // Query guided emotions table for themes
    const { data: guidedData, error: guidedError } = await supabase
      .from("guided_journal_emotions_table")
      .select("theme")
      .eq("user_UID", user_UID)
      .not("theme", "is", null);

    if (guidedError) {
      console.error("Error fetching guided themes:", guidedError);
      // Don't return error immediately, use what we have
    }

    // If both queries failed, return an error
    if (freeformError && guidedError) {
      return res.status(500).json({
        message: "Error fetching themes from both tables",
        details: `Freeform: ${freeformError.message}, Guided: ${guidedError.message}`,
      });
    }

    // Combine and count themes from both tables
    const allThemes = [
      ...(freeformData || []).map((item) => item.theme),
      ...(guidedData || []).map((item) => item.theme),
    ];

    // Count theme occurrences
    const themeCount = {};
    allThemes.forEach((theme) => {
      if (theme && theme.trim() !== "") {
        themeCount[theme] = (themeCount[theme] || 0) + 1;
      }
    });

    // Sort themes by count (descending) and get top 3
    const topThemes = Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([theme, count]) => ({ theme, count }));

    res.status(200).json({
      message: "Top themes fetched successfully",
      user_UID,
      topThemes,
      totalThemeCount: allThemes.length,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      message: "An unexpected error occurred",
      details: error.message,
    });
  }
}
