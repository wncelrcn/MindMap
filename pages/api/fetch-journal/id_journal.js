import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id, type } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Journal ID is required" });
    }

    let data = null;
    let error = null;

    if (type === "freeform") {
      ({ data, error } = await supabase
        .from("freeform_journaling_table")
        .select("*")
        .eq("journal_id", id)
        .single());

      if (error && error.code !== "PGRST116") {
        console.error("Database error (freeform):", error);
        return res
          .status(500)
          .json({ message: "Error fetching journal entry from freeform" });
      }
    }

    if (!data) {
      ({ data, error } = await supabase
        .from("guided_journaling_table")
        .select("*")
        .eq("journal_id", id)
        .single());

      if (error) {
        console.error("Database error (guided):", error);
        return res
          .status(500)
          .json({ message: "Error fetching journal entry from guided" });
      }
    }

    if (!data) {
      return res
        .status(404)
        .json({ message: "Journal entry not found in both tables" });
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
