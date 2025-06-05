import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { journal_id, journal_type } = req.body;

    if (!journal_id || !journal_type) {
      return res
        .status(400)
        .json({ message: "Journal ID and type are required" });
    }

    // Determine which table to query based on journal_type
    const tableName =
      journal_type === "freeform"
        ? "freeform_journal_emotions_table"
        : "guided_journal_emotions_table";

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("journal_id", journal_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No emotions data found - return empty result rather than error
        return res.status(200).json({
          message: "No emotions data found for this journal entry",
          emotions: null,
        });
      }

      console.error("Database error:", error);
      return res.status(500).json({
        message: "Error fetching emotions data",
        details: error.message,
      });
    }

    res.status(200).json({
      message: "Emotions data fetched successfully",
      emotions: data.emotions,
      emotion_id: data.emotion_id,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
