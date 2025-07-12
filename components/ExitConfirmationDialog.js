// components/ExitConfirmationDialog.js
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const useExitConfirmation = (hasChanges, resetChanges) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitDestination, setExitDestination] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Handle route change start
    const handleRouteChangeStart = (url) => {
      // If there are changes and it's not an explicit finish action
      if (hasChanges && !url.includes("/dashboard?completed=true")) {
        // Store the destination URL
        setExitDestination(url);
        // Show the dialog
        setShowExitDialog(true);
        // Prevent default navigation behavior
        router.events.emit("routeChangeError");
        // Keep the URL the same
        throw "routeChange aborted to show dialog";
      }
    };

    // Handle browser's back/forward buttons and window close
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    // Add event listeners
    router.events.on("routeChangeStart", handleRouteChangeStart);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup event listeners
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges, router]);

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    resetChanges(); // Reset the changes state to prevent re-interception
    // Navigate to the destination
    if (exitDestination) {
      router.push(exitDestination);
    } else {
      // If no specific destination (e.g., when using browser back button)
      router.back();
    }
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  const handleCustomExit = (destination) => {
    if (hasChanges) {
      setExitDestination(destination);
      setShowExitDialog(true);
    } else {
      router.push(destination);
    }
  };

  return {
    showExitDialog,
    handleConfirmExit,
    handleCancelExit,
    handleCustomExit,
  };
};

const ExitConfirmationDialog = ({
  open,
  onConfirm,
  onCancel,
  title = "Unsaved Changes",
  message = "You have unsaved content in your journal entry. Leaving this page will cause your work to be lost. Are you sure you want to leave?",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="exit-dialog-title"
      aria-describedby="exit-dialog-description"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          padding: "1rem",
          fontFamily: poppins.style.fontFamily,
        },
      }}
    >
      <DialogTitle
        id="exit-dialog-title"
        sx={{
          fontFamily: poppins.style.fontFamily,
          fontWeight: 600,
          color: "#2D1B6B",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={{
            fontFamily: poppins.style.fontFamily,
            color: "#4A3E8E",
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={onCancel}
          sx={{
            backgroundColor: "#E2DDF9",
            color: "#4E2BBD",
            textTransform: "none",
            fontWeight: 500,
            borderRadius: "16px",
            padding: "0.75rem 1.5rem",
            boxShadow: "none",
            fontFamily: poppins.style.fontFamily,
            "&:hover": {
              backgroundColor: "#D4C7F3",
            },
          }}
        >
          Stay on Page
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            backgroundColor: "#4E2BBD",
            color: "#fff",
            textTransform: "none",
            fontWeight: 500,
            borderRadius: "16px",
            padding: "0.75rem 1.5rem",
            boxShadow: "none",
            fontFamily: poppins.style.fontFamily,
            ml: 2,
            "&:hover": {
              backgroundColor: "#40249c",
            },
          }}
        >
          Leave Without Saving
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExitConfirmationDialog;
