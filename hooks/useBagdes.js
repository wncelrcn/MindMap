// hooks/useBadges.js
import { useState, useEffect, useCallback } from "react";
import badgeService from "@/utils/badgeService";

// Session storage helpers with error handling
const getShownBadges = () => {
  try {
    const stored = sessionStorage.getItem("shownBadges");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Error reading shown badges from session storage:", error);
    return [];
  }
};

const setShownBadges = (badges) => {
  try {
    sessionStorage.setItem("shownBadges", JSON.stringify(badges));
  } catch (error) {
    console.warn("Error saving shown badges to session storage:", error);
  }
};

export const useBadges = () => {
  const [badgeQueue, setBadgeQueue] = useState([]);
  const [currentBadge, setCurrentBadge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle new badge unlocks
  const handleBadgeUnlock = useCallback((newBadges) => {
    const shownBadges = getShownBadges();

    // Filter out badges that have already been shown
    const unseenBadges = newBadges.filter(
      (badge) => !shownBadges.includes(badge.badge_id)
    );

    if (unseenBadges.length > 0) {
      // Add to queue
      setBadgeQueue((prev) => [...prev, ...unseenBadges]);

      // Mark as shown
      const newShownBadges = [
        ...shownBadges,
        ...unseenBadges.map((b) => b.badge_id),
      ];
      setShownBadges(newShownBadges);
    }
  }, []);

  // Process badge queue - show one at a time
  useEffect(() => {
    if (badgeQueue.length > 0 && !showModal) {
      const nextBadge = badgeQueue[0];
      setBadgeQueue((prev) => prev.slice(1));
      setCurrentBadge(nextBadge);
      setShowModal(true);
    }
  }, [badgeQueue, showModal]);

  // Listen for badge unlocks
  useEffect(() => {
    const unsubscribe = badgeService.addListener(handleBadgeUnlock);
    return unsubscribe;
  }, [handleBadgeUnlock]);

  // Manual badge check
  const checkBadges = useCallback(async () => {
    setIsLoading(true);
    try {
      await badgeService.checkBadgeUnlocks();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Modal handlers
  const closeModal = useCallback(() => {
    setShowModal(false);
    setCurrentBadge(null);
  }, []);

  const viewAllBadges = useCallback(() => {
    setShowModal(false);
    setCurrentBadge(null);
    // Return navigation function for flexibility
    return () => (window.location.href = "/profile#badges");
  }, []);

  return {
    currentBadge,
    showModal,
    isLoading,
    closeModal,
    viewAllBadges,
    checkBadges,
    badgeQueue: badgeQueue.length, // Just return count for debugging
  };
};
