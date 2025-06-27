import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt sensitive data using AES encryption
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text with IV prepended
 */
export function encryptData(text) {
  if (!text) return text;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Prepend IV to encrypted text
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Return original text if encryption fails
  }
}

/**
 * Decrypt sensitive data using AES decryption
 * @param {string} encryptedText - Encrypted text with IV prepended
 * @returns {string} - Decrypted text
 */
export function decryptData(encryptedText) {
  if (!encryptedText || !encryptedText.includes(":")) return encryptedText;

  try {
    const textParts = encryptedText.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encrypted = textParts.join(":");

    const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return encryptedText; // Return original text if decryption fails
  }
}

/**
 * Encrypt journal data using JWT
 * @param {Object} journalData - Journal data to encrypt
 * @returns {string} - JWT token containing encrypted data
 */
export function encryptJournalData(journalData) {
  try {
    // Create a payload with encrypted sensitive fields
    const payload = {
      ...journalData,
      journal_entry: encryptData(
        typeof journalData.journal_entry === "object"
          ? JSON.stringify(journalData.journal_entry)
          : journalData.journal_entry
      ),
      title: encryptData(journalData.title),
      journal_summary: encryptData(journalData.journal_summary),
      encrypted: true,
      timestamp: Date.now(),
    };

    // Sign the payload with JWT
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1y", // Long expiration for stored journal data
      issuer: "mindmap-journal",
      audience: "mindmap-users",
    });
  } catch (error) {
    console.error("JWT encryption error:", error);
    throw new Error("Failed to encrypt journal data");
  }
}

/**
 * Decrypt journal data from JWT
 * @param {string} encryptedToken - JWT token containing encrypted data
 * @returns {Object} - Decrypted journal data
 */
export function decryptJournalData(encryptedToken) {
  try {
    // Verify and decode the JWT
    const decoded = jwt.verify(encryptedToken, JWT_SECRET, {
      issuer: "mindmap-journal",
      audience: "mindmap-users",
    });

    if (!decoded.encrypted) {
      // Return as-is if not encrypted (backward compatibility)
      return decoded;
    }

    // Decrypt sensitive fields
    const decryptedData = {
      ...decoded,
      journal_entry: (() => {
        try {
          const decrypted = decryptData(decoded.journal_entry);
          return JSON.parse(decrypted);
        } catch {
          return decryptData(decoded.journal_entry);
        }
      })(),
      title: decryptData(decoded.title),
      journal_summary: decryptData(decoded.journal_summary),
    };

    // Remove encryption metadata
    delete decryptedData.encrypted;
    delete decryptedData.timestamp;
    delete decryptedData.iat;
    delete decryptedData.exp;
    delete decryptedData.iss;
    delete decryptedData.aud;

    return decryptedData;
  } catch (error) {
    console.error("JWT decryption error:", error);
    throw new Error("Failed to decrypt journal data");
  }
}

/**
 * Encrypt sensitive fields in a journal entry for database storage
 * @param {Object} entry - Journal entry object
 * @returns {Object} - Entry with encrypted sensitive fields
 */
export function encryptJournalEntry(entry) {
  const sensitiveFields = ["journal_entry", "title", "journal_summary"];
  const encryptedEntry = { ...entry };

  sensitiveFields.forEach((field) => {
    if (encryptedEntry[field]) {
      encryptedEntry[field] = encryptData(
        typeof encryptedEntry[field] === "object"
          ? JSON.stringify(encryptedEntry[field])
          : encryptedEntry[field]
      );
    }
  });

  // Don't save is_encrypted flag to database
  return encryptedEntry;
}

/**
 * Check if a value appears to be encrypted (contains IV separator)
 * @param {string} value - Value to check
 * @returns {boolean} - True if value appears encrypted
 */
function isEncryptedValue(value) {
  return typeof value === "string" && value.includes(":") && value.length > 32;
}

/**
 * Decrypt sensitive fields in a journal entry from database
 * @param {Object} entry - Journal entry object with encrypted fields
 * @returns {Object} - Entry with decrypted sensitive fields
 */
export function decryptJournalEntry(entry) {
  const sensitiveFields = ["journal_entry", "title", "journal_summary"];
  const decryptedEntry = { ...entry };

  sensitiveFields.forEach((field) => {
    if (decryptedEntry[field] && isEncryptedValue(decryptedEntry[field])) {
      try {
        const decrypted = decryptData(decryptedEntry[field]);
        // Try to parse as JSON first, fallback to string
        try {
          decryptedEntry[field] = JSON.parse(decrypted);
        } catch {
          decryptedEntry[field] = decrypted;
        }
      } catch (error) {
        console.error(`Error decrypting field ${field}:`, error);
        // Keep original value if decryption fails
      }
    }
  });

  return decryptedEntry;
}
