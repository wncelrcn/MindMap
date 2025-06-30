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

    const user_UID = user.id;

    const today = new Date();
    const currentDayOfWeek = today.getDay();

    const daysToLastSunday = currentDayOfWeek === 0 ? 7 : currentDayOfWeek + 7;

    const lastWeekSunday = new Date(today);
    lastWeekSunday.setDate(today.getDate() - daysToLastSunday);

    const lastWeekSaturday = new Date(lastWeekSunday);
    lastWeekSaturday.setDate(lastWeekSunday.getDate() + 6);

    const startDate = lastWeekSunday.toISOString().split("T")[0];
    const endDate = lastWeekSaturday.toISOString().split("T")[0];

    const { data: existingRecap, error: recapCheckError } = await supabase
      .from("recap")
      .select("*")
      .eq("user_UID", user_UID)
      .eq("date_range_start", startDate)
      .eq("date_range_end", endDate)
      .single();

    if (recapCheckError && recapCheckError.code !== "PGRST116") {
      console.error("Error checking existing recap:", recapCheckError);
      return res.status(500).json({
        message: "Error checking existing recap",
        details: recapCheckError.message,
      });
    }

    if (existingRecap) {
      return res.status(200).json({
        message: "Recap already exists for this week",
        user_UID,
        dateRange: {
          startDate,
          endDate,
          description: `Last week (${startDate} to ${endDate})`,
        },
        existingRecap: true,
        recapData: existingRecap,
      });
    }

    const { data: freeformData, error: freeformError } = await supabase
      .from("freeform_journaling_table")
      .select(
        "journal_id, journal_summary, date_created, time_created, journal_entry"
      )
      .eq("user_UID", user_UID)
      .gte("date_created", startDate)
      .lte("date_created", endDate)
      .not("journal_summary", "is", null)
      .order("date_created", { ascending: false })
      .order("time_created", { ascending: false });

    if (freeformError) {
      console.error("Error fetching freeform summaries:", freeformError);
      return res.status(500).json({
        message: "Error fetching freeform summaries",
        details: freeformError.message,
      });
    }

    const { data: guidedData, error: guidedError } = await supabase
      .from("guided_journaling_table")
      .select(
        "journal_id, journal_summary, date_created, time_created, journal_entry"
      )
      .eq("user_UID", user_UID)
      .gte("date_created", startDate)
      .lte("date_created", endDate)
      .not("journal_summary", "is", null)
      .order("date_created", { ascending: false })
      .order("time_created", { ascending: false });

    if (guidedError) {
      console.error("Error fetching guided summaries:", guidedError);
      return res.status(500).json({
        message: "Error fetching guided summaries",
        details: guidedError.message,
      });
    }

    const combinedSummaries = [
      ...(freeformData || []).map((entry) => ({
        ...entry,
        journal_type: "freeform",
      })),
      ...(guidedData || []).map((entry) => ({
        ...entry,
        journal_type: "guided",
      })),
    ];

    combinedSummaries.sort((a, b) => {
      const aDateTime = new Date(`${a.date_created}T${a.time_created}`);
      const bDateTime = new Date(`${b.date_created}T${b.time_created}`);
      return bDateTime - aDateTime;
    });

    const summaryTexts = combinedSummaries
      .map((entry) => entry.journal_summary)
      .filter((summary) => summary && summary.trim() !== "");

    const combinedSummaryText = summaryTexts.join("\n\n");

    res.status(200).json({
      message: "Journal summaries prepared for analysis",
      user_UID,
      dateRange: {
        startDate,
        endDate,
        description: `Last week (${startDate} to ${endDate})`,
      },
      existingRecap: false,
      analysisData: {
        summaries: combinedSummaries,
        summaryTexts,
        combinedSummaryText,
        freeformSummaryCount: freeformData?.length || 0,
        guidedSummaryCount: guidedData?.length || 0,
        totalSummaryCount: combinedSummaries.length,
        averageSummaryLength:
          summaryTexts.length > 0
            ? Math.round(
                summaryTexts.reduce((acc, text) => acc + text.length, 0) /
                  summaryTexts.length
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({
      message: "An unexpected error occurred",
      details: error.message,
    });
  }
}
