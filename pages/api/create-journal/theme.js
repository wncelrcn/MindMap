import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { theme } = req.query;

  if (!theme) {
    return res.status(400).json({ error: "Theme name is required" });
  }

  try {
    const { data, error } = await supabase
      .from("themes")
      .select(
        `
        id,
        name,
        categories (
          id,
          name,
          about,
          useful_when
        )
      `
      )
      .eq("name", theme)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Theme not found" });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
