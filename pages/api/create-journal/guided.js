import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      user_id,
      theme_id,
      category_id,
      question_set_id,
      journal_entry,
      title,
    } = req.body;

    // Validation
    if (!user_id || !theme_id || !category_id || !journal_entry || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("user_table")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Insert into guided_journaling_table
    const { data, error } = await supabase
      .from("guided_journaling_table")
      .insert({
        user_id,
        theme_id,
        category_id,
        title,
        question_set_id,
        journal_entry,
        date_created: new Date().toISOString().split("T")[0],
        time_created: new Date().toTimeString().split(" ")[0],
      })
      .select();

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Failed to create journal entry",
        error: error.message,
      });
    }

    return res
      .status(201)
      .json({ message: "Journal entry created successfully", data });
  } catch (error) {
    console.error("Server error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
