import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { journal_id, user_UID, emotions, journal_type } = req.body;

    if (!journal_id || !user_UID || !emotions || !journal_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Determine which table to insert into based on journal_type
    const tableName =
      journal_type === "freeform"
        ? "freeform_journal_emotions_table"
        : "guided_journal_emotions_table";

    const { data, error } = await supabase
      .from(tableName)
      .insert({
        journal_id: journal_id,
        user_UID: user_UID,
        emotions: emotions,
      })
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Error saving emotions data",
        details: error.message,
      });
    }

    console.log(`Emotions data saved successfully to ${tableName}:`, data);

    res.status(200).json({
      message: "Emotions data saved successfully",
      data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
