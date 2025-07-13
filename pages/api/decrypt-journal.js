import createClient from "@/utils/supabase/api";
import { decryptJournalEntry } from "@/lib/encryption";

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

    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({ error: "Encrypted data is required" });
    }

    // Validate that encryptedData is an object
    if (typeof encryptedData !== "object" || Array.isArray(encryptedData)) {
      return res
        .status(400)
        .json({ error: "Encrypted data must be an object" });
    }

    // Decrypt the journal entry
    const decryptedEntry = decryptJournalEntry(encryptedData);

    return res.status(200).json({
      success: true,
      decryptedData: decryptedEntry,
    });
  } catch (error) {
    console.error("Decryption API error:", error);
    return res.status(500).json({
      error: "Failed to decrypt journal data",
      details: error.message,
    });
  }
}
