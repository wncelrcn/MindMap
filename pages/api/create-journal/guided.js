import createClient from "@/utils/supabase/api";
import { encryptJournalEntry } from "@/lib/encryption";
import {
  getUserTimezoneDate,
  getUserTimezoneTime,
} from "@/utils/helper/timezone";

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

    const {
      user_UID,
      theme_id,
      category_id,
      question_set_id,
      journal_entry,
      title,
      journal_summary,
      timezone,
    } = req.body;

    // Validation
    if (!user_UID || !theme_id || !category_id || !journal_entry || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify that the user_UID matches the authenticated user
    if (user_UID !== user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: User ID mismatch" });
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("user_table")
      .select("*")
      .eq("user_UID", user_UID)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use user's timezone if provided, otherwise fall back to UTC
    const userTimezone = timezone || "UTC";

    // Create the journal entry object
    const journalEntryData = {
      user_UID,
      theme_id,
      category_id,
      title,
      question_set_id,
      journal_entry,
      journal_summary,
      date_created: getUserTimezoneDate(userTimezone),
      time_created: getUserTimezoneTime(userTimezone),
    };

    // Encrypt sensitive fields before saving to database
    const encryptedJournalEntry = encryptJournalEntry(journalEntryData);

    // Insert into guided_journaling_table
    const { data, error } = await supabase
      .from("guided_journaling_table")
      .insert(encryptedJournalEntry)
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
