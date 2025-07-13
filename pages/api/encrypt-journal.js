import createClient from "@/utils/supabase/api";
import { encryptJournalEntry } from "@/lib/encryption";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
        error: "User not authenticated",
        details: authError?.message,
      });
    }

    const { journalData } = req.body;

    if (!journalData) {
      return res.status(400).json({ error: "Journal data is required" });
    }

    // Validate that journalData is an object
    if (typeof journalData !== "object" || Array.isArray(journalData)) {
      return res.status(400).json({ error: "Journal data must be an object" });
    }

    // Encrypt the journal entry
    const encryptedEntry = encryptJournalEntry(journalData);

    return res.status(200).json({
      success: true,
      encryptedData: encryptedEntry,
    });
  } catch (error) {
    console.error("Encryption API error:", error);
    return res.status(500).json({
      error: "Failed to encrypt journal data",
      details: error.message,
    });
  }
}
