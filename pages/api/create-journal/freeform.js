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

    const { user_UID, journal_entry, title, journal_summary, timezone } =
      req.body;

    if (!user_UID || !journal_entry || !title || !journal_summary) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify that the user_UID matches the authenticated user
    if (user_UID !== user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: User ID mismatch" });
    }

    // Use user's timezone if provided, otherwise fall back to UTC
    const userTimezone = timezone || "UTC";

    // Create the journal entry object
    const journalEntryData = {
      user_UID: user_UID,
      journal_entry: journal_entry,
      title: title,
      date_created: getUserTimezoneDate(userTimezone),
      time_created: getUserTimezoneTime(userTimezone),
      journal_summary: journal_summary,
    };

    // Encrypt sensitive fields before saving to database
    const encryptedJournalEntry = encryptJournalEntry(journalEntryData);

    const { data, error } = await supabase
      .from("freeform_journaling_table")
      .insert(encryptedJournalEntry)
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
