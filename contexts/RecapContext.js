import { createContext, useContext, useEffect, useState } from "react";

const RecapContext = createContext();

export const useRecap = () => {
  const context = useContext(RecapContext);
  if (!context) {
    throw new Error("useRecap must be used within RecapProvider");
  }
  return context;
};

export const RecapProvider = ({ children, user }) => {
  const [recapData, setRecapData] = useState(null);
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapInitialized, setRecapInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Only run if user exists, has changed, and we haven't initialized for this user
    if (user && user.id && user.id !== currentUserId && !recapLoading) {
      console.log("Initializing recap for user:", user.id);
      setCurrentUserId(user.id);
      setRecapInitialized(false);
      fetchRecap();
    }
  }, [user?.id, currentUserId, recapLoading]);

  const fetchRecap = async () => {
    console.log("fetchRecap called, setting loading to true");
    setRecapLoading(true);
    try {
      const response = await fetch("/api/recap/recap", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecapData(data);
        console.log("Recap data loaded:", data);

        if (!data.existingRecap && data.analysisData) {
          console.log("No existing recap found, analyzing with AI...");

          try {
            const analyzerResponse = await fetch("/api/recap/recap-analyzer", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: data.analysisData.combinedSummaryText,
                dateRange: data.dateRange,
                user_UID: data.user_UID,
              }),
            });

            if (analyzerResponse.ok) {
              const analyzerData = await analyzerResponse.json();
              console.log("AI Analysis Result:", analyzerData);
              setRecapData((prev) => ({
                ...prev,
                aiAnalysis: analyzerData,
              }));
            } else {
              console.error("Failed to analyze with AI");
            }
          } catch (error) {
            console.error("Error calling recap analyzer:", error);
          }
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch recap:", errorData.message);
      }
    } catch (error) {
      console.error("Error fetching recap:", error);
    } finally {
      setRecapLoading(false);
      setRecapInitialized(true);
    }
  };

  const refreshRecap = () => {
    setRecapInitialized(false);
    if (user && user.id) {
      fetchRecap();
    }
  };

  const value = {
    recapData,
    recapLoading,
    recapInitialized,
    refreshRecap,
  };

  return (
    <RecapContext.Provider value={value}>{children}</RecapContext.Provider>
  );
};
