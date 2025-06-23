import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const DisclaimerModal = ({
  open,
  hideDisclaimer,
  onDisclaimerToggle,
  onUnderstandClick,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          border: "1px solid #e0e0e0",
          fontFamily: poppins.style.fontFamily,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          pb: 1,
          color: "#2D1B6B",
          fontFamily: poppins.style.fontFamily,
          fontWeight: 600,
        }}
      >
        <InfoIcon sx={{ color: "#2D1B6B" }} />
        Important Disclaimer
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography
          sx={{
            mb: 2,
            lineHeight: 1.6,
            color: "#333",
            fontFamily: poppins.style.fontFamily,
          }}
        >
          The insights provided by MindMap are generated using AI based on your
          journal entry and are intended to support self-reflection and
          emotional awareness.
        </Typography>
        <Typography
          sx={{
            mb: 3,
            lineHeight: 1.6,
            color: "#333",
            fontFamily: poppins.style.fontFamily,
          }}
        >
          These insights do not constitute psychological diagnosis, professional
          advice, or therapy. If you are experiencing distress or need mental
          health support, please contact a licensed mental health professional.
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={hideDisclaimer}
              onChange={onDisclaimerToggle}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#2D1B6B",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#2D1B6B",
                },
              }}
            />
          }
          label="Don't show this again"
          sx={{
            color: "#666",
            fontFamily: poppins.style.fontFamily,
            fontWeight: 400,
            "& .MuiFormControlLabel-label": {
              fontSize: "0.9rem",
              fontFamily: poppins.style.fontFamily,
              fontWeight: 400,
              letterSpacing: "0.2px",
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onUnderstandClick}
          variant="contained"
          sx={{
            backgroundColor: "#2D1B6B",
            borderRadius: "12px",
            textTransform: "none",
            fontFamily: poppins.style.fontFamily,
            fontWeight: 500,
            px: 4,
            py: 1,
            "&:hover": {
              backgroundColor: "#1a0f4d",
            },
          }}
        >
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisclaimerModal;
