import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Poppins } from "next/font/google";
import { processEmotionData } from "@/utils/helper/emotion/emotionConfig";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const MoodDistributionChart = ({ emotions: rawEmotions }) => {
  // Process raw emotion data using shared utility
  const emotions = React.useMemo(
    () => processEmotionData(rawEmotions),
    [rawEmotions]
  );
  // Create dynamic circular gradient based on emotions and their intensities
  const createDynamicGradient = () => {
    if (
      !emotions ||
      emotions.length === 0 ||
      emotions[0].emotion === "No Data"
    ) {
      return "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)";
    }

    if (emotions.length === 1) {
      const emotion = emotions[0];
      const intensity = emotion.intensity / 100;
      return `radial-gradient(circle at center, ${emotion.color}${Math.round(
        intensity * 80 + 40
      )} 0%, ${emotion.color}${Math.round(intensity * 60 + 25)} 35%, ${
        emotion.color
      }${Math.round(intensity * 35 + 15)} 70%, ${emotion.color}${Math.round(
        intensity * 15 + 5
      )} 100%)`;
    }

    // Calculate positions for spread out circles without overlap
    const getEmotionPositions = () => {
      if (!emotions || emotions.length === 0) return [];

      if (emotions.length === 1) {
        return [{ left: "50%", top: "50%" }];
      }

      const positions = [];
      const centerX = 50;
      const centerY = 50;
      const radiusX = 35; // Increased horizontal radius for more spread
      const radiusY = 30; // Increased vertical radius for more spread

      emotions.forEach((_, index) => {
        // Distribute emotions in a circular pattern with more spacing
        const angle = (index / emotions.length) * 2 * Math.PI - Math.PI / 2; // Start from top
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);

        positions.push({
          left: `${Math.max(12, Math.min(88, x))}%`,
          top: `${Math.max(12, Math.min(88, y))}%`,
        });
      });

      return positions;
    };

    const emotionPositions = getEmotionPositions();

    // Create multiple radial gradients positioned at each emotion's location
    const radialGradients = emotions
      .map((emotion, index) => {
        const position = emotionPositions[index];
        if (!position) return null;

        // Calculate intensity-based spread and opacity - more prominent
        const intensity = emotion.intensity / 100;
        const spread = Math.round(intensity * 50 + 30); // 30% to 80% spread
        const opacity = Math.round(intensity * 70 + 40); // 40% to 110% opacity (capped at 100)
        const midOpacity = Math.round(opacity * 0.7); // Stronger mid-point
        const falloff = Math.round(intensity * 20 + 10); // 10% to 30% falloff

        // Create more vibrant color stops
        return `radial-gradient(circle at ${position.left} ${position.top}, ${
          emotion.color
        }${Math.min(opacity, 100)} 0%, ${emotion.color}${midOpacity} ${
          spread * 0.6
        }%, ${emotion.color}${Math.round(
          midOpacity * 0.5
        )} ${spread}%, transparent ${spread + falloff}%)`;
      })
      .filter(Boolean);

    // Create subtle base gradient for overall cohesion
    const baseGradient =
      "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255, 0.0) 100%)";

    // Combine all gradients
    return [baseGradient, ...radialGradients].join(", ");
  };

  // Calculate positions for spread out circles without overlap
  const getEmotionPositions = () => {
    if (!emotions || emotions.length === 0) return [];

    if (emotions.length === 1) {
      return [{ left: "50%", top: "50%" }];
    }

    const positions = [];
    const centerX = 50;
    const centerY = 50;
    const radiusX = 35; // Increased horizontal radius for more spread
    const radiusY = 30; // Increased vertical radius for more spread

    emotions.forEach((_, index) => {
      // Distribute emotions in a circular pattern with more spacing
      const angle = (index / emotions.length) * 2 * Math.PI - Math.PI / 2; // Start from top
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);

      positions.push({
        left: `${Math.max(12, Math.min(88, x))}%`,
        top: `${Math.max(12, Math.min(88, y))}%`,
      });
    });

    return positions;
  };

  const emotionPositions = getEmotionPositions();

  return (
    <Paper
      elevation={0}
      sx={{
        background: createDynamicGradient(),
        borderRadius: "24px",
        p: 4,
        mb: 4,
        position: "relative",
        overflow: "hidden",
        minHeight: "365px",
        backdropFilter: "blur(20px)",
        border: "0.5px solid #2D1B6B",
      }}
    >
      {/* Emotion circles spread out without overlap */}
      {emotions.map((emotion, index) => {
        const position = emotionPositions[index];
        if (!position) return null;

        // Calculate circle size based on intensity and other emotions
        const calculateCircleSize = () => {
          const minSize = 60;
          const maxSize = 120;

          // Base size from own intensity
          let baseSize =
            minSize + (emotion.intensity / 100) * (maxSize - minSize);

          // Additional size based on interaction with other emotions
          let sizeFactor = 1;

          // Increase size based on number of emotions
          const emotionCountFactor = Math.min(emotions.length * 0.15, 0.5);
          sizeFactor += emotionCountFactor;

          // Increase size based on other emotions' intensities
          const otherEmotionsIntensity = emotions
            .filter((_, idx) => idx !== index)
            .reduce((sum, em) => sum + em.intensity, 0);
          const otherEmotionsFactor =
            (otherEmotionsIntensity / (emotions.length - 1 || 1) / 100) * 0.3;
          sizeFactor += otherEmotionsFactor;

          return Math.min(baseSize * sizeFactor, 160); // Cap at 160px
        };

        const circleSize = calculateCircleSize();

        // Calculate background glow size based on emotion interaction
        const calculateGlowSize = () => {
          // Base multiplier
          let multiplier = 0.1;

          // Increase glow based on number of emotions (more emotions = larger glows)
          const emotionCountFactor = Math.min(emotions.length * 0.5, 2);
          multiplier += emotionCountFactor;

          // Increase glow based on this emotion's intensity
          const intensityFactor = (emotion.intensity / 100) * 1.5;
          multiplier += intensityFactor;

          // Increase glow based on other emotions' intensities
          const otherEmotionsIntensity = emotions
            .filter((_, idx) => idx !== index)
            .reduce((sum, em) => sum + em.intensity, 0);
          const otherEmotionsFactor =
            otherEmotionsIntensity / (emotions.length - 1 || 1) / 100;
          multiplier += otherEmotionsFactor;

          return circleSize * Math.min(multiplier, 6.5); // Cap at 6.5x
        };

        const glowSize = calculateGlowSize();

        // Calculate font sizes based on circle size
        const percentageSize = Math.max(0.4, circleSize / 100);
        const labelSize = Math.max(0.3, circleSize / 120);

        return (
          <Box
            key={emotion.emotion}
            sx={{
              position: "absolute",
              ...position,
              transform: "translate(-50%, -50%)",
              "&:hover .glow-circle": {
                transform: "translate(-50%, -50%) scale(1.1)",
                opacity: 1,
              },
            }}
          >
            {/* Background radial glow circle */}
            <Box
              className="glow-circle"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${glowSize}px`,
                height: `${glowSize}px`,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${emotion.color}60 0%, ${emotion.color}40 30%, ${emotion.color}25 50%, ${emotion.color}15 70%, transparent 100%)`,
                zIndex: 1,
                opacity: 0.8,
                transition: "all 0.3s ease",
              }}
            />

            {/* Main emotion circle */}
            <Box
              sx={{
                position: "relative",
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: `radial-gradient(circle, ${emotion.color}70 0%, ${emotion.color}60 50%, ${emotion.color}40 75%, ${emotion.color}20 90%, transparent 100%)`,
                borderRadius: "50%",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                zIndex: 2,
                mask: "radial-gradient(circle, black 0%, black 75%, transparent 100%)",
                WebkitMask:
                  "radial-gradient(circle, black 0%, black 75%, transparent 100%)",
                "&:hover": {
                  transform: "scale(1.1)",
                  background: `radial-gradient(circle, ${emotion.color}80 0%, ${emotion.color}70 50%, ${emotion.color}50 75%, ${emotion.color}30 90%, transparent 100%)`,
                  mask: "radial-gradient(circle, black 0%, black 70%, transparent 100%)",
                  WebkitMask:
                    "radial-gradient(circle, black 0%, black 70%, transparent 100%)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80%",
                  height: "80%",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)`,
                  pointerEvents: "none",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: `${percentageSize}rem - 0.01rem`,
                  fontWeight: 500,
                  color: "white",
                  fontFamily: poppins.style.fontFamily,
                  zIndex: 1,
                  mb: 0.3,
                }}
              >
                {emotion.intensity}%
              </Typography>
              <Typography
                sx={{
                  fontSize: `${labelSize}rem - 0.01rem`,
                  fontWeight: 500,
                  color: "white",
                  fontFamily: poppins.style.fontFamily,
                  textAlign: "center",
                  zIndex: 1,
                  lineHeight: 1,
                }}
              >
                {emotion.emotion}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};

export default MoodDistributionChart;
