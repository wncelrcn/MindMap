// utils/badgeService.js
import axios from "axios";

class BadgeService {
  constructor() {
    this.listeners = new Set();
    this.isChecking = false;
  }

  // Add event listener for badge unlocks
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of badge unlock
  notifyBadgeUnlock(badges) {
    this.listeners.forEach((callback) => {
      try {
        callback(badges);
      } catch (error) {
        console.error("Error in badge unlock listener:", error);
      }
    });

    // Also dispatch a custom event for compatibility
    window.dispatchEvent(
      new CustomEvent("badgeUnlocked", {
        detail: { badges },
      })
    );
  }

  // Check for badge unlocks with retry logic
  async checkBadgeUnlocks(retryCount = 0) {
    if (this.isChecking) {
      console.log("Badge check already in progress");
      return [];
    }

    this.isChecking = true;

    try {
      console.log("Checking for badge unlocks...");

      const response = await axios.post(
        "/api/badges/check-unlock",
        {},
        {
          timeout: 10000,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const newBadges = response.data.newlyUnlocked || [];

        if (newBadges.length > 0) {
          console.log("New badges unlocked:", newBadges);
          this.notifyBadgeUnlock(newBadges);
          return newBadges;
        }
      }

      return [];
    } catch (error) {
      console.error("Badge check failed:", error);

      // Retry on network errors or server errors
      if (retryCount < 2) {
        const shouldRetry =
          error.code === "ECONNABORTED" ||
          error.response?.status >= 500 ||
          !error.response; // Network error

        if (shouldRetry) {
          console.log(`Retrying badge check (attempt ${retryCount + 1})`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return this.checkBadgeUnlocks(retryCount + 1);
        }
      }

      throw error;
    } finally {
      this.isChecking = false;
    }
  }

  // Trigger badge check after journal entry
  async triggerBadgeCheckAfterJournal() {
    try {
      // Add a small delay to ensure database operations are complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.checkBadgeUnlocks();
    } catch (error) {
      console.error("Failed to check badges after journal entry:", error);
    }
  }
}

const badgeService = new BadgeService();

export default badgeService;
