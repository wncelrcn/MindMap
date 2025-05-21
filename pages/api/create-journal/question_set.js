import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { theme, category } = req.query;

  if (!theme || !category) {
    return res.status(400).json({ error: "Theme and category are required" });
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
          question_sets (
            id,
            set_name,
            questions
          )
        )
      `
      )
      .eq("name", theme)
      .eq("categories.name", category)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Theme or category not found" });
    }

    const selectedCategory = data.categories.find(
      (cat) => cat.name === category
    );
    if (!selectedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json({
      themeId: data.id,
      categoryId: selectedCategory.id,
      question_sets: selectedCategory.question_sets || [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
