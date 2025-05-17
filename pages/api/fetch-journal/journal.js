import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // TO BE CHANGED
    const { data, error } = await supabase
      .from("freeform_journaling_table")
      .select("*")
      .eq("user_id", user_id)
      .order("date_created", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ message: "Error fetching journal entries" });
    }

    res.status(200).json({
      message: "Journal entries fetched successfully",
      entries: data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
