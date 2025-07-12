import { useState, useEffect } from "react";

export const useTypingDetection = (content, delay = 2000) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showButtons, setShowButtons] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Handle typing detection
  useEffect(() => {
    if (isTyping) {
      setShowButtons(false);
      const typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 1000); // Stop detecting typing after 1 second of inactivity

      return () => clearTimeout(typingTimer);
    }
  }, [isTyping]);

  // Handle button visibility based on activity and content
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastActivity >= delay && content && !isTyping) {
        setShowButtons(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [lastActivity, content, isTyping, delay]);

  const handleTyping = () => {
    setLastActivity(Date.now());
    setIsTyping(true);
  };

  const hideButtons = () => {
    setShowButtons(false);
  };

  return {
    showButtons,
    isTyping,
    handleTyping,
    hideButtons,
  };
};
