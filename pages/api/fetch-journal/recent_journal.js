import createClient from "@/utils/supabase/api";
import { decryptJournalEntry } from "@/lib/encryption";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createClient(req, res);

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({
        message: "User not authenticated",
        details: authError?.message,
      });
    }

    const { user_UID } = req.body;

    if (!user_UID || user_UID === "undefined") {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Verify that the user_UID matches the authenticated user
    if (user_UID !== user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: User ID mismatch" });
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

    // Decrypt and normalize data
    const decryptedFreeformData = freeformData.map((entry) =>
      decryptJournalEntry({ ...entry, journal_type: "freeform" })
    );

    const decryptedGuidedData = guidedData.map((entry) =>
      decryptJournalEntry({ ...entry, journal_type: "guided" })
    );

    // Combine data
    const combinedEntries = [...decryptedFreeformData, ...decryptedGuidedData];

    // Sort by most recent (date and time)
    combinedEntries.sort((a, b) => {
      const aDateTime = new Date(`${a.date_created}T${a.time_created}`);
      const bDateTime = new Date(`${b.date_created}T${b.time_created}`);
      return bDateTime - aDateTime;
    });

    // Get only the 4 most recent
    const recentEntries = combinedEntries.slice(0, 4);

    res.status(200).json({
      message: "Recent journal entries fetched successfully",
      entries: recentEntries,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}
