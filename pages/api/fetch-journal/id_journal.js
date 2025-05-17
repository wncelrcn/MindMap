import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("Request body:", req.body);

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Journal ID is required" });
    }

    console.log("Using ID:", id);

    const { data, error } = await supabase
      .from("freeform_journaling_table")
      .select("*")
      .eq("journal_id", id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Error fetching journal entry" });
    }

    if (!data) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    res.status(200).json({
      message: "Journal entry fetched successfully",
      entry: data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
