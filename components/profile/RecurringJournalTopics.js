import { Box, Typography, Stack } from "@mui/material";
import { Poppins } from "next/font/google";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SpaIcon from "@mui/icons-material/Spa";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import FlagIcon from "@mui/icons-material/Flag";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TodayIcon from "@mui/icons-material/Today";
import BrushIcon from "@mui/icons-material/Brush";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PhotoIcon from "@mui/icons-material/Photo";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import FlightIcon from "@mui/icons-material/Flight";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import GroupIcon from "@mui/icons-material/Group";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import BuildIcon from "@mui/icons-material/Build";
import NatureIcon from "@mui/icons-material/Nature";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const RecurringJournalTopics = ({ topics, topicTexts, loading }) => {
  // Fallback texts when no meaningful data is available
  const fallbackTexts = [
    "Start your journaling journey",
    "Reflect on your daily experiences",
    "Track your personal growth",
  ];

  // Icon mapping for different journaling themes
  const getThemeIcon = (theme) => {
    const iconStyle = { mr: 1, fontSize: "1.4rem" };

    const themeIconMap = {
      "Self-Reflection": <PersonIcon sx={iconStyle} />,
      "Goal Setting": <FlagIcon sx={iconStyle} />,
      Gratitude: <FavoriteIcon sx={iconStyle} />,
      "Emotional Processing": <PsychologyIcon sx={iconStyle} />,
      "Daily Experiences": <TodayIcon sx={iconStyle} />,
      Creativity: <BrushIcon sx={iconStyle} />,
      "Personal Growth": <TrendingUpIcon sx={iconStyle} />,
      "Mental Health": <HealthAndSafetyIcon sx={iconStyle} />,
      Mindfulness: <SpaIcon sx={iconStyle} />,
      Memories: <PhotoIcon sx={iconStyle} />,
      "Dream Journaling": <BedtimeIcon sx={iconStyle} />,
      Travel: <FlightIcon sx={iconStyle} />,
      "Health and Wellness": <FitnessCenterIcon sx={iconStyle} />,
      Relationships: <GroupIcon sx={iconStyle} />,
      "Career and Productivity": <BusinessCenterIcon sx={iconStyle} />,
      Spirituality: <AutoAwesomeIcon sx={iconStyle} />,
      Affirmations: <RecordVoiceOverIcon sx={iconStyle} />,
      "Problem-Solving": <BuildIcon sx={iconStyle} />,
      "Nature and Environment": <NatureIcon sx={iconStyle} />,
      "Hobbies and Interests": <SportsEsportsIcon sx={iconStyle} />,
      "Start your journaling journey": <MenuBookIcon sx={iconStyle} />,
      "Reflect on your daily experiences": <TodayIcon sx={iconStyle} />,
      "Track your personal growth": <TrendingUpIcon sx={iconStyle} />,
    };

    return themeIconMap[theme] || <MenuBookIcon sx={iconStyle} />;
  };

  // Default icons that cycle through if more texts than icons (fallback)
  const defaultIcons = [
    <MenuBookIcon sx={{ mr: 1, fontSize: "1.4rem" }} />,
    <TodayIcon sx={{ mr: 1, fontSize: "1.4rem" }} />,
    <TrendingUpIcon sx={{ mr: 1, fontSize: "1.4rem" }} />,
  ];

  let displayTopics;

  if (topics) {
    // If full topics object is provided, use it
    displayTopics = topics;
  } else {
    // Determine which texts to use
    let textsToUse;

    if (loading) {
      // Show fallback while loading
      textsToUse = fallbackTexts;
    } else if (
      topicTexts &&
      topicTexts.length > 0 &&
      topicTexts.some((text) => text && text.trim() !== "")
    ) {
      // Use topicTexts if they exist and are not empty
      textsToUse = topicTexts;
    } else {
      // Use fallback if no meaningful topics
      textsToUse = fallbackTexts;
    }

    // Ensure we always have exactly 3 items to maintain height
    if (textsToUse.length < 3) {
      textsToUse = [...textsToUse, ...fallbackTexts].slice(0, 3);
    } else if (textsToUse.length > 3) {
      textsToUse = textsToUse.slice(0, 3);
    }

    // Map texts to topics with dynamic icons
    displayTopics = textsToUse.map((text, index) => ({
      icon: getThemeIcon(text),
      text: text,
    }));
  }

  return (
    <Box
      sx={{
        backgroundColor: "#5C35C2",
        borderRadius: 4,
        p: 2.5,
        color: "white",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontFamily: poppins.style.fontFamily,
          mb: 2,
          fontSize: "1.2rem",
        }}
      >
        Recurring Journal Topics
      </Typography>

      <Stack spacing={2}>
        {displayTopics.map((topic, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
            {topic.icon}
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: "1rem",
              }}
            >
              {topic.text}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default RecurringJournalTopics;
