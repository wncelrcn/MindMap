/**
 * Client-side encryption utility that calls server-side encryption endpoints
 * This ensures encryption keys are never exposed to the client
 */

/**
 * Encrypt journal data by calling the server-side encryption endpoint
 * @param {Object} journalData - The journal data to encrypt
 * @returns {Promise<Object>} - The encrypted journal data
 */
export async function encryptJournalData(journalData) {
  try {
    const response = await fetch("/api/encrypt-journal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ journalData }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to encrypt journal data");
    }

    return result.encryptedData;
  } catch (error) {
    console.error("Client-side encryption error:", error);
    throw error;
  }
}

/**
 * Decrypt journal data by calling the server-side decryption endpoint
 * @param {Object} encryptedData - The encrypted journal data
 * @returns {Promise<Object>} - The decrypted journal data
 */
export async function decryptJournalData(encryptedData) {
  try {
    const response = await fetch("/api/decrypt-journal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ encryptedData }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to decrypt journal data");
    }

    return result.decryptedData;
  } catch (error) {
    console.error("Client-side decryption error:", error);
    throw error;
  }
}

/**
 * Helper function to safely store journal data with encryption
 * @param {Object} journalData - The journal data to store
 * @param {string} apiEndpoint - The API endpoint to store the data
 * @returns {Promise<Object>} - The API response
 */
export async function storeEncryptedJournal(journalData, apiEndpoint) {
  try {
    // Encrypt the data first
    const encryptedData = await encryptJournalData(journalData);

    // Store the encrypted data
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to store journal data");
    }

    return result;
  } catch (error) {
    console.error("Error storing encrypted journal:", error);
    throw error;
  }
}

/**
 * Helper function to safely retrieve and decrypt journal data
 * @param {string} apiEndpoint - The API endpoint to retrieve the data from
 * @returns {Promise<Object>} - The decrypted journal data
 */
export async function retrieveDecryptedJournal(apiEndpoint) {
  try {
    // Retrieve the encrypted data
    const response = await fetch(apiEndpoint);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to retrieve journal data");
    }

    // If the data is encrypted, decrypt it
    if (result.entries && Array.isArray(result.entries)) {
      const decryptedEntries = await Promise.all(
        result.entries.map(async (entry) => {
          if (isEncryptedEntry(entry)) {
            return await decryptJournalData(entry);
          }
          return entry;
        })
      );
      return { ...result, entries: decryptedEntries };
    } else if (result.entry && isEncryptedEntry(result.entry)) {
      const decryptedEntry = await decryptJournalData(result.entry);
      return { ...result, entry: decryptedEntry };
    }

    return result;
  } catch (error) {
    console.error("Error retrieving decrypted journal:", error);
    throw error;
  }
}

/**
 * Helper function to check if an entry appears to be encrypted
 * @param {Object} entry - The journal entry to check
 * @returns {boolean} - True if the entry appears to be encrypted
 */
function isEncryptedEntry(entry) {
  const sensitiveFields = ["journal_entry", "title", "journal_summary"];
  return sensitiveFields.some((field) => {
    const value = entry[field];
    return (
      typeof value === "string" && value.includes(":") && value.length > 32
    );
  });
}

// Export individual functions for flexibility
export { storeEncryptedJournal, retrieveDecryptedJournal };
