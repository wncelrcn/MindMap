import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { user_UID } = req.query;

    if (!user_UID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch freeform journaling entries
    const { data: freeformData, error: freeformError } = await supabase
      .from("freeform_journaling_table")
      .select("*")
      .eq("user_UID", user_UID);

    if (freeformError) {
      console.error("Freeform DB error:", freeformError);
      return res
        .status(500)
        .json({ message: "Error fetching freeform journals" });
    }

    // Fetch guided journaling entries
    const { data: guidedData, error: guidedError } = await supabase
      .from("guided_journaling_table")
      .select("*")
      .eq("user_UID", user_UID);

    if (guidedError) {
      console.error("Guided DB error:", guidedError);
      return res
        .status(500)
        .json({ message: "Error fetching guided journals" });
    }

    // Normalize and combine data
    const combinedEntries = [
      ...freeformData.map((entry) => ({
        ...entry,
        journal_type: "freeform",
      })),
      ...guidedData.map((entry) => ({
        ...entry,
        journal_type: "guided",
      })),
    ];

    combinedEntries.sort((a, b) => {
      const aDateTime = new Date(`${a.date_created}T${a.time_created}`);
      const bDateTime = new Date(`${b.date_created}T${b.time_created}`);

      return bDateTime - aDateTime;
    });

    res.status(200).json({
      message: "Journal entries fetched successfully",
      entries: combinedEntries,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
