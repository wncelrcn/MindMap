import {
  Box,
  Typography,
  Modal,
  Fade,
  Button,
} from "@mui/material";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function BadgeUnlockModal({ open, badge, onClose, onViewBadges }) {
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!badge) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #F9F8FE 0%, #E2DDF9 100%)",
            borderRadius: "24px",
            padding: { xs: "2rem", md: "3rem" },
            maxWidth: { xs: "90%", md: "500px" },
            width: "100%",
            textAlign: "center",
            border: "2px solid rgba(78, 43, 189, 0.1)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Confetti Animation */}
          {open && (
            <Confetti
              width={dimensions.width}
              height={dimensions.height}
              recycle={false}
              numberOfPieces={500}
            />
          )}

          {/* Header */}
          <Typography
            sx={{
              fontSize: { xs: "1.5rem", md: "1.8rem" },
              fontWeight: 600,
              color: "#2D1B6B",
              fontFamily: poppins.style.fontFamily,
              mb: 1,
            }}
          >
            Congratulations!
          </Typography>

          {/* New Badge Unlock Text */}
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.1rem" },
              fontWeight: 400,
              color: "#6B46C1",
              fontFamily: poppins.style.fontFamily,
              mb: 3,
            }}
          >
            You unlocked a new badge!
          </Typography>

          {/* Animated Badge Icon */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4E2BBD 0%, #9333EA 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                animation: "pulse 2s infinite ease-in-out",
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.1)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            >
              <Box
                component="img"
                src={badge.image_url}
                alt={badge.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </Box>
          </Box>

          {/* Badge Name */}
          <Typography
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              fontWeight: 600,
              color: "#2D1B6B",
              fontFamily: poppins.style.fontFamily,
              mb: 1,
            }}
          >
            {badge.name}
          </Typography>

          {/* Badge Description */}
          <Typography
            sx={{
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontWeight: 400,
              color: "#6B46C1",
              fontFamily: poppins.style.fontFamily,
              mb: 3,
              maxWidth: "80%",
              mx: "auto",
            }}
          >
            {badge.description}
          </Typography>

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                fontFamily: poppins.style.fontFamily,
                color: "#4E2BBD",
                borderColor: "#4E2BBD",
                borderRadius: "12px",
                px: 4,
                py: 1,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(78, 43, 189, 0.1)",
                  borderColor: "#4E2BBD",
                },
              }}
            >
              Close
            </Button>
            <Button
              onClick={onViewBadges}
              variant="contained"
              sx={{
                fontFamily: poppins.style.fontFamily,
                background: "linear-gradient(90deg, #4E2BBD 0%, #9333EA 100%)",
                color: "white",
                borderRadius: "12px",
                px: 4,
                py: 1,
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(90deg, #45249C 0%, #7B2CBF 100%)",
                },
              }}
            >
              View Badges
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}