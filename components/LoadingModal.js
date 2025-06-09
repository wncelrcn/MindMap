import {
  Box,
  Typography,
  Modal,
  CircularProgress,
  Fade,
  LinearProgress,
} from "@mui/material";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const LoadingModal = ({ isGeneratingInsights, progress, loadingStep }) => (
  <Modal
    open={isGeneratingInsights}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(10px)",
    }}
  >
    <Fade in={isGeneratingInsights}>
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
        {/* Header */}
        <Typography
          sx={{
            fontSize: { xs: "1.5rem", md: "1.8rem" },
            fontWeight: 600,
            color: "#2D1B6B",
            fontFamily: poppins.style.fontFamily,
            mb: 2,
          }}
        >
          Generating Your Insights
        </Typography>

        {/* Animated Brain Icon */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <CircularProgress
            size={80}
            thickness={2}
            sx={{
              color: "#4E2BBD",
              position: "absolute",
              animationDuration: "2s",
            }}
          />
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4E2BBD 0%, #9333EA 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            🧠
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(78, 43, 189, 0.1)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #4E2BBD 0%, #9333EA 100%)",
                borderRadius: 4,
                transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              },
              "& .MuiLinearProgress-bar1Determinate": {
                transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            }}
          />
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#4E2BBD",
              fontFamily: poppins.style.fontFamily,
              mt: 1,
              transition: "all 0.3s ease",
            }}
          >
            {Math.round(progress)}%
          </Typography>
        </Box>

        {/* Loading Step */}
        <Typography
          sx={{
            fontSize: { xs: "1rem", md: "1.1rem" },
            fontWeight: 400,
            color: "#6B46C1",
            fontFamily: poppins.style.fontFamily,
            mb: 2,
            minHeight: "1.5rem",
          }}
        >
          {loadingStep}
        </Typography>

        {/* Features List */}
        <Box sx={{ textAlign: "left", mt: 3 }}>
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#2D1B6B",
              fontFamily: poppins.style.fontFamily,
              mb: 1,
            }}
          >
            What we're creating for you:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {[
              "📝 Personalized mood summary",
              "🎭 Detailed emotion analysis",
              "💡 Insights into your feelings",
              "📊 Interactive mood visualization",
            ].map((feature, index) => (
              <Typography
                key={index}
                sx={{
                  fontSize: "0.85rem",
                  color: "#666",
                  fontFamily: poppins.style.fontFamily,
                  opacity: progress > (index + 1) * 25 ? 1 : 0.5,
                  transition: "opacity 0.3s ease",
                }}
              >
                {feature}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Fade>
  </Modal>
);

export default LoadingModal;
