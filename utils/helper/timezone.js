/**
 * Utility functions for handling timezones
 */

/**
 * Get current date in user's timezone as YYYY-MM-DD format
 * @param {string} timezone - IANA timezone identifier (e.g., 'Asia/Manila', 'America/New_York')
 * @returns {string} Date in YYYY-MM-DD format
 */
export function getUserTimezoneDate(timezone = "UTC") {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // Returns YYYY-MM-DD format
}

/**
 * Get current time in user's timezone as HH:MM:SS format
 * @param {string} timezone - IANA timezone identifier (e.g., 'Asia/Manila', 'America/New_York')
 * @returns {string} Time in HH:MM:SS format
 */
export function getUserTimezoneTime(timezone = "UTC") {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(now); // Returns HH:MM:SS format
}

/**
 * Get current date and time in user's timezone as ISO string
 * @param {string} timezone - IANA timezone identifier (e.g., 'Asia/Manila', 'America/New_York')
 * @returns {string} Full ISO string with user's timezone
 */
export function getUserTimezoneDateTime(timezone = "UTC") {
  const now = new Date();
  const date = getUserTimezoneDate(timezone);
  const time = getUserTimezoneTime(timezone);
  return `${date}T${time}.000Z`;
}

/**
 * Convert a date to user's timezone
 * @param {Date} date - The date to convert
 * @param {string} timezone - IANA timezone identifier (e.g., 'Asia/Manila', 'America/New_York')
 * @returns {Date} Date adjusted to user's timezone
 */
export function convertToUserTimezone(date, timezone = "UTC") {
  const timeInTimezone = date.toLocaleString("en-US", { timeZone: timezone });
  return new Date(timeInTimezone);
}

/**
 * Client-side function to get user's timezone
 * @returns {string} User's timezone identifier
 */
export function getUserTimezone() {
  if (typeof window !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return "UTC";
}
