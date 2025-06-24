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
  personalityTitle = "Neutral Explorer",
  personalityDescription = "Welcome! Since we’re starting fresh, I’ve set you up with a Neutral Explorer personality. This is a balanced, curious, and adaptable persona designed to help you dive into any topic with an open mind.",
}) => {
  const titleWords = personalityTitle.split(" ");

  return (
    <Box
      sx={{
        height: "350px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!isFlipped ? (
        <>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "#5C35C2",
              mb: 2,
              fontSize: "1rem",
              flexShrink: 0, // Prevent shrinking
            }}
          >
            Personality
          </Typography>
          <Box
            sx={{
              flex: 1,
              display: "flex-start",
              mt: 3,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
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
          <Box sx={{ position: "absolute", top: 0, right: 20 }}>
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
              flexShrink: 0,
            }}
          >
            Personality
          </Typography>
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "8px",
              marginBottom: "40px",
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255, 255, 255, 0.3)",
                borderRadius: "2px",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.5)",
                },
              },
            }}
          >
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
          </Box>
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
    </Box>
  );
};

export default Personality;
