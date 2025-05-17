import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { user_id, journal_entry, title } = req.body;

    if (!user_id || !journal_entry || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const now = new Date();
    const { data, error } = await supabase
      .from("freeform_journaling_table")
      .insert({
        user_id: user_id,
        journal_entry: journal_entry,
        title: title,
        date_created: now.toISOString(),
        time_created: now.toTimeString().split(" ")[0],
      })
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Error creating journal entry" });
    }

    res
      .status(200)
      .json({ message: "Journal entry created successfully", data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
