// Map emotion labels to display properties
export const emotionConfig = {
  sadness: {
    color: "#4682B4",
    gradientColor: "linear-gradient(135deg, #4682B4 0%, #1E3A8A 100%)",
    icon: "😢",
    displayName: "Sadness",
  },
  anger: {
    color: "#FF6B6B",
    gradientColor: "linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)",
    icon: "😠",
    displayName: "Anger",
  },
  love: {
    color: "#FF69B4",
    gradientColor: "linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)",
    icon: "❤️",
    displayName: "Love",
  },
  surprise: {
    color: "#F59E0B",
    gradientColor: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    icon: "😲",
    displayName: "Surprise",
  },
  fear: {
    color: "#9333EA",
    gradientColor: "linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)",
    icon: "😱",
    displayName: "Fear",
  },
  happiness: {
    color: "#FFD700",
    gradientColor: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    icon: "😄",
    displayName: "Happiness",
  },
  joy: {
    color: "#FFD700",
    gradientColor: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    icon: "😄",
    displayName: "Joy",
  },
  neutral: {
    color: "#6B7280",
    gradientColor: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
    icon: "😐",
    displayName: "Neutral",
  },
  disgust: {
    color: "#84CC16",
    gradientColor: "linear-gradient(135deg, #84CC16 0%, #65A30D 100%)",
    icon: "🤢",
    displayName: "Disgust",
  },
  shame: {
    color: "#DC2626",
    gradientColor: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
    icon: "🙈",
    displayName: "Shame",
  },
  guilt: {
    color: "#7C3AED",
    gradientColor: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
    icon: "😔",
    displayName: "Guilt",
  },
  confusion: {
    color: "#1E3A8A",
    gradientColor: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
    icon: "😕",
    displayName: "Confusion",
  },
  desire: {
    color: "#EF4444",
    gradientColor: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    icon: "🔥",
    displayName: "Desire",
  },
  sarcasm: {
    color: "#10B981",
    gradientColor: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    icon: "😏",
    displayName: "Sarcasm",
  },
};

// Helper function to process emotion data
export const processEmotionData = (rawEmotions) => {
  if (!rawEmotions || !Array.isArray(rawEmotions)) {
    return [
      {
        emotion: "No Data",
        intensity: 0,
        description:
          "Emotions analysis is not available for this journal entry.",
        color: "#999999",
        gradientColor: "linear-gradient(135deg, #999999 0%, #666666 100%)",
        icon: "📊",
      },
    ];
  }

  return rawEmotions.map((emotion) => {
    const config = emotionConfig[emotion.label] || {
      color: "#999999",
      gradientColor: "linear-gradient(135deg, #999999 0%, #666666 100%)",
      icon: "💭",
      displayName:
        emotion.label.charAt(0).toUpperCase() + emotion.label.slice(1),
    };

    return {
      emotion: config.displayName,
      intensity: Math.round(emotion.score * 100),
      description:
        emotion.desc ||
        `You appear to be experiencing ${config.displayName.toLowerCase()} based on the themes and expressions in your journal entry.`,
      color: config.color,
      gradientColor: config.gradientColor,
      icon: config.icon,
    };
  });
};
