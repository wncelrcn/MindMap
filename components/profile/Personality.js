import { Box, Typography, IconButton } from "@mui/material";
import { Poppins } from "next/font/google";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const Personality = ({
  isFlipped,
  handleFlip,
  personalityTitle = "The Resilient Quick-Thinking Maverick",
  personalityDescription = "You are a bold, independent thinker who thrives under pressure, quickly adapts to challenges, and fearlessly carves their own path, unafraid to challenge norms and take risks to achieve their vision.",
}) => {
  // Split the title into words for individual styling
  const titleWords = personalityTitle.split(" ");

  return (
    <>
      {!isFlipped ? (
        <>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "#5C35C2",
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Personality
          </Typography>
          <Box sx={{ mb: "auto" }}>
            {titleWords.map((word, index) => (
              <Typography
                key={index}
                variant="h4"
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  color: "#4527A0",
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: "1.75rem",
                }}
              >
                {word}
              </Typography>
            ))}
          </Box>
          <Box sx={{ position: "absolute", top: 20, right: 20 }}>
            <svg
              width="30"
              height="30"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30 10L20 20L30 30L20 40"
                stroke="#5C35C2"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </>
      ) : (
        <>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "white",
              mb: 2,
              fontSize: "1rem",
            }}
          >
            Personality
          </Typography>
          <Typography
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "white",
              lineHeight: 1.6,
              fontSize: "1.05rem",
            }}
          >
            {personalityDescription}
          </Typography>
        </>
      )}
      <IconButton
        onClick={handleFlip}
        sx={{
          position: "absolute",
          bottom: 10,
          right: 10,
          color: isFlipped ? "white" : "#5C35C2",
          padding: "4px",
        }}
      >
        <FlipCameraAndroidIcon fontSize="medium" />
      </IconButton>
    </>
  );
};

export default Personality;
