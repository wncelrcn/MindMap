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
      setCurrentUserId(user.id);
      setRecapInitialized(false);
      fetchRecap();
    }
  }, [user?.id, currentUserId, recapLoading]);

  const fetchRecap = async () => {
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

        if (!data.existingRecap && data.analysisData) {
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
              setRecapData((prev) => ({
                ...prev,
                aiAnalysis: analyzerData,
              }));
            } else {
            }
          } catch (error) {}
        }
      } else {
        const errorData = await response.json();
      }
    } catch (error) {
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
