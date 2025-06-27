import { Box, Typography, Modal, Button, TextField } from "@mui/material";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const FeedbackModal = ({
  open,
  onClose,
  modalStep,
  currentCard,
  feedbackText,
  setFeedbackText,
  onYesClick,
  onNoClick,
  onFeedbackSubmit,
  onContinueReading,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 16px 48px rgba(60,40,120,0.16)",
          p: { xs: 3, md: 4 },
          width: { xs: "90%", md: "500px" },
          maxWidth: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
          fontFamily: poppins.style.fontFamily,
          outline: "none",
        }}
      >
        {modalStep === "question" && (
          <>
            <Typography
              sx={{
                fontSize: { xs: "1.3rem", md: "1.5rem" },
                fontWeight: 600,
                color: "#5A33B7",
                mb: 2,
                textAlign: "center",
                fontFamily: poppins.style.fontFamily,
              }}
            >
              How does this feel?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: "#333",
                mb: 3,
                textAlign: "center",
                fontFamily: poppins.style.fontFamily,
                lineHeight: 1.5,
              }}
            >
              Does this recap section about "{currentCard?.title}" accurately
              reflect your experience?
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                onClick={onYesClick}
                sx={{
                  backgroundColor: "#5A33B7",
                  color: "white",
                  px: 3,
                  py: 1.5,
                  borderRadius: "25px",
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "#4A2A97",
                  },
                }}
              >
                Yes, this feels right
              </Button>
              <Button
                onClick={onNoClick}
                sx={{
                  backgroundColor: "transparent",
                  color: "#5A33B7",
                  border: "2px solid #5A33B7",
                  px: 3,
                  py: 1.5,
                  borderRadius: "25px",
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "#5A33B7",
                    color: "white",
                  },
                }}
              >
                Not quite right
              </Button>
            </Box>
          </>
        )}

        {modalStep === "positive" && (
          <>
            <Typography
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                mb: 2,
                textAlign: "center",
              }}
            >
              ✨
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.3rem", md: "1.5rem" },
                fontWeight: 600,
                color: "#5A33B7",
                mb: 2,
                textAlign: "center",
                fontFamily: poppins.style.fontFamily,
              }}
            >
              That's wonderful to hear!
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: "#333",
                mb: 3,
                textAlign: "center",
                fontFamily: poppins.style.fontFamily,
                lineHeight: 1.5,
              }}
            >
              We're glad our insights resonate with your experience. Your
              self-awareness is a powerful tool for growth.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={onContinueReading}
                sx={{
                  backgroundColor: "#5A33B7",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  borderRadius: "25px",
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "#4A2A97",
                  },
                }}
              >
                Continue Reading
              </Button>
            </Box>
          </>
        )}

        {modalStep === "negative" && (
          <>
            <Typography
              sx={{
                fontSize: { xs: "1.3rem", md: "1.5rem" },
                fontWeight: 600,
                color: "#5A33B7",
                mb: 2,
                textAlign: "center",
                fontFamily: poppins.style.fontFamily,
              }}
            >
              Help us understand
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: "#333",
                mb: 3,
                textAlign: "center",
                fontFamily: poppins.style.fontFamily,
                lineHeight: 1.5,
              }}
            >
              We'd love to know what doesn't feel quite right about this
              section. Your feedback helps us improve.
            </Typography>
            <TextField
              multiline
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what feels different from your experience..."
              sx={{
                width: "100%",
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontFamily: poppins.style.fontFamily,
                  "&:hover fieldset": {
                    borderColor: "#5A33B7",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#5A33B7",
                  },
                },
                "& .MuiInputBase-input": {
                  fontFamily: poppins.style.fontFamily,
                },
                "& .MuiInputBase-input::placeholder": {
                  fontFamily: poppins.style.fontFamily,
                  opacity: 0.7,
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={onFeedbackSubmit}
                disabled={!feedbackText.trim()}
                sx={{
                  backgroundColor: feedbackText.trim() ? "#5A33B7" : "#ccc",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  borderRadius: "25px",
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: feedbackText.trim() ? "#4A2A97" : "#ccc",
                  },
                }}
              >
                Submit Feedback
              </Button>
            </Box>
          </>
        )}

        {modalStep === "thankYou" && (
          <>
            <Typography
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                mb: 2,
                textAlign: "center",
              }}
            >
              🙏
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.3rem", md: "1.5rem" },
                fontWeight: 600,
                color: "#5A33B7",
                mb: 2,
                textAlign: "center",
                fontFamily: poppins.style.fontFamily,
              }}
            >
              Thank you for your feedback!
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.1rem" },
                color: "#333",
                mb: 3,
                textAlign: "center",
                fontFamily: poppins.style.fontFamily,
                lineHeight: 1.5,
              }}
            >
              We really appreciate you taking the time to share your thoughts.
              We'll keep this in mind to make your future recaps even better.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={onContinueReading}
                sx={{
                  backgroundColor: "#5A33B7",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  borderRadius: "25px",
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "#4A2A97",
                  },
                }}
              >
                Continue Reading
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default FeedbackModal;
