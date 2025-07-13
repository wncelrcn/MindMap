import Navbar from "@/components/layout/navbar";
import LoadingModal from "@/components/LoadingModal";
import {
  Box,
  TextField,
  Typography,
  Button,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Poppins, Raleway, Quicksand } from "next/font/google";
import { createClient } from "@/utils/supabase/server-props";
import { useTypingDetection } from "@/hooks/useTypingDetection";
import ExitConfirmationDialog, {
  useExitConfirmation,
} from "@/components/ExitConfirmationDialog";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export async function getServerSideProps(context) {
  const supabase = createClient(context);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: data.user,
    },
  };
}

export default function Journal({ user }) {
  const [user_UID, setUser_UID] = useState(user.id);
  const [title, setTitle] = useState("Journal Title");
  const [editingTitle, setEditingTitle] = useState(false);
  const [content, setContent] = useState("");
  const [sections, setSections] = useState([]);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Loading states
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [openShortEntryDialog, setOpenShortEntryDialog] = useState(false);

  const router = useRouter();

  // Use the custom typing detection hook
  const {
    showButtons: showButton,
    handleTyping,
    hideButtons,
  } = useTypingDetection(content);

  // Use the exit confirmation hook
  const {
    showExitDialog,
    handleConfirmExit,
    handleCancelExit,
    handleCustomExit,
  } = useExitConfirmation(hasChanges, () => setHasChanges(false));

  // Track changes for exit confirmation
  useEffect(() => {
    const checkForChanges = () => {
      const hasContent =
        content.trim() !== "" ||
        sections.some((section) => section.content.trim() !== "");
      setHasChanges(hasContent);
    };

    checkForChanges();
  }, [content, sections]);

  const handleTitleClick = () => setEditingTitle(true);
  const handleTitleBlur = () => {
    if (title.trim() === "") {
      setTitle("Journal Title");
    }
    setEditingTitle(false);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    handleTyping();
  };

  const handleGoDeeper = async () => {
    hideButtons();

    let history = "";
    if (content.trim()) {
      history += `Q: Journal Entry\nA: ${content.trim()}\n`;
    }
    sections.forEach((section) => {
      if (section.subtitle && section.content.trim()) {
        history += `Q: ${section.subtitle}\nA: ${section.content.trim()}\n`;
      }
    });

    let lastText = "";
    if (sections.length === 0) {
      lastText = content;
    } else {
      lastText = sections[sections.length - 1].content;
    }

    const res = await fetch("/api/create-journal/freeform-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, lastText }),
    });

    const data = await res.json();

    setSections([...sections, { subtitle: data.question, content: "" }]);
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
    handleTyping();
  };

  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleFinishEntry = async () => {
    try {
      if (
        !content.trim() &&
        !sections.some((section) => section.content.trim())
      ) {
        setError("Please enter some content before saving");
        return;
      }

      const fullText =
        content.trim() + " " + sections.map((s) => s.content.trim()).join(" ");
      const wordCount = fullText.split(/\s+/).filter(Boolean).length;

      if (wordCount < 30) {
        setOpenShortEntryDialog(true);
        return;
      }

      // Reset changes state to prevent exit confirmation dialog
      setHasChanges(false);

      // Start loading
      setIsGeneratingInsights(true);
      setProgress(0);
      setLoadingStep("Preparing your journal...");

      // Build journalData as an array of {question, answer} objects
      const journalData = [];
      if (content.trim()) {
        journalData.push({
          question: "Journal Entry",
          answer: content.trim(),
        });
      }
      sections.forEach((section, index) => {
        if (section.content.trim()) {
          journalData.push({
            question: section.subtitle?.trim() || `Section ${index + 1}`,
            answer: section.content.trim(),
          });
        }
      });

      setProgress(20);
      setLoadingStep("Analyzing your thoughts and emotions with AI...");

      // Call both summary and emotions APIs in parallel
      const [summaryRes, emotionsRes] = await Promise.all([
        fetch("/api/analyze-journal/journal_summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journal_text: journalData }),
        }),
        fetch("/api/analyze-journal/journal_emotions_fastapi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journal_text: journalData }),
        }),
      ]);

      setProgress(60);
      setLoadingStep("Processing insights...");

      const summaryData = await summaryRes.json();
      const emotionsData = await emotionsRes.json();

      if (!summaryRes.ok) {
        throw new Error(summaryData.message || "Failed to generate summary");
      }

      if (!emotionsRes.ok) {
        console.warn("FastAPI emotions analysis failed:", emotionsData.message);
      }

      setProgress(75);
      setLoadingStep("Saving your journal entry...");

      // Create the journal entry
      const res = await fetch("/api/create-journal/freeform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journal_summary: summaryData["summary"],
          user_UID: user_UID,
          journal_entry: journalData,
          title: title.trim() || "Untitled Entry",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create entry");
      }

      setProgress(90);
      setLoadingStep("Finalizing your insights...");

      // Save emotions data if available
      if (
        emotionsRes.ok &&
        emotionsData.emotions &&
        data.data &&
        data.data[0]
      ) {
        try {
          await fetch("/api/create-journal/save-emotions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              journal_id: data.data[0].journal_id,
              user_UID: user_UID,
              emotions: emotionsData.emotions,
              journal_type: "freeform",
              theme: summaryData["theme"],
            }),
          });
        } catch (emotionError) {
          console.warn("Failed to save emotions data:", emotionError);
        }
      }

      setProgress(100);
      setLoadingStep("Complete! Redirecting...");

      // Small delay to show completion
      setTimeout(() => {
        setIsGeneratingInsights(false);
        setHasChanges(false); // Reset to prevent exit dialog
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      setIsGeneratingInsights(false);
      setError(error.message);
      console.error("Error creating journal entry:", error);
    }
  };

  const handleSuggestionsClick = () => {
    router.push("/guided-journaling");
  };

  return (
    <>
      <Head>
        <title>Create a Journal Entry</title>
        <meta
          name="description"
          content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

      <Dialog
        open={openShortEntryDialog}
        onClose={() => setOpenShortEntryDialog(false)}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            padding: "1rem",
            fontFamily: poppins.style.fontFamily,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: poppins.style.fontFamily,
            fontWeight: 600,
            color: "#2D1B6B",
          }}
        >
          Entry Too Short for Insights
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "#4A3E8E",
            }}
          >
            Your journal entry seems a bit short to generate meaningful
            insights. We recommend writing a bit more to get the best results.
            <br />
            <br />
            If you're having trouble, you can also try our guided journaling
            prompts.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "0 1rem 1rem" }}>
          <Button
            onClick={() => router.push("/guided-journaling")}
            sx={{
              backgroundColor: "#E2DDF9",
              color: "#4E2BBD",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "12px",
              padding: "0.5rem 1.5rem",
              boxShadow: "none",
              fontFamily: poppins.style.fontFamily,
              "&:hover": {
                backgroundColor: "#D4C7F3",
              },
            }}
          >
            Try Guided Journaling
          </Button>
          <Button
            onClick={() => setOpenShortEntryDialog(false)}
            autoFocus
            sx={{
              backgroundColor: "#4E2BBD",
              color: "#fff",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "12px",
              padding: "0.5rem 1.5rem",
              boxShadow: "none",
              marginLeft: "1rem",
              fontFamily: poppins.style.fontFamily,
              "&:hover": {
                backgroundColor: "#40249c",
              },
            }}
          >
            Continue Writing
          </Button>
        </DialogActions>
      </Dialog>

      <Box>
        <Navbar />

        {/* Loading Modal */}
        <LoadingModal
          isGeneratingInsights={isGeneratingInsights}
          progress={progress}
          loadingStep={loadingStep}
        />

        {/* Header with image */}
        <Box position="relative" width="100%" height="234px">
          <Box
            position="absolute"
            top={16}
            zIndex={1}
            sx={{ padding: { xs: "1.5rem", md: "2rem 8rem" } }}
          >
            <div
              onClick={() => handleCustomExit("/dashboard")}
              style={{ cursor: "pointer" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#2D1B6B"
              >
                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
              </svg>
            </div>
          </Box>
          <Image
            src="/assets/header.png"
            alt="Journal"
            layout="fill"
            objectFit="cover"
            priority
          />
        </Box>

        {/* Journal Content */}
        <Box
          sx={{
            padding: { xs: "2rem 1.5rem", md: "3rem 8rem" },
            paddingBottom: "6rem",
          }}
        >
          {editingTitle ? (
            <TextField
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              autoFocus
              variant="standard"
              InputProps={{
                disableUnderline: true,
                style: {
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: "#2D1B6B",
                  lineHeight: "normal",
                  fontFamily: poppins.style.fontFamily,
                },
              }}
              sx={{
                padding: 0,
                height: "3rem",
                fontFamily: poppins.style.fontFamily,
              }}
            />
          ) : (
            <>
              {/* Title */}
              <TextField
                fullWidth
                value={title || ""}
                placeholder="Journal Title"
                onClick={handleTitleClick}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  style: {
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: title ? "#2D1B6B" : "#A5A5A5",
                    lineHeight: "normal",
                    fontFamily: poppins.style.fontFamily,
                  },
                }}
                sx={{
                  padding: 0,
                  height: "3rem",
                  fontFamily: poppins.style.fontFamily,
                }}
              />
            </>
          )}

          <Typography
            mt={1}
            mb={3}
            fontWeight={500}
            fontSize="1.4rem"
            color="#2D1B6B"
            sx={{
              fontFamily: poppins.style.fontFamily,
              fontWeight: 300,
            }}
          >
            {getFormattedDate()}
          </Typography>

          {/* Journal Entry */}
          <TextField
            multiline
            fullWidth
            minRows={5}
            placeholder="Type your thoughts..."
            variant="standard"
            value={content}
            onChange={handleContentChange}
            InputProps={{
              disableUnderline: true,
              style: {
                fontStyle: content ? "normal" : "italic",
                fontSize: "1rem",
                color: "#4A3E8E",
                fontFamily: poppins.style.fontFamily,
              },
            }}
            sx={{
              fontFamily: poppins.style.fontFamily,
              marginBottom: "1.5rem",
            }}
          />

          {sections.map((section, index) => (
            <Box key={index} sx={{ marginBottom: "2rem" }}>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  color: "#2D1B6B",
                  lineHeight: "normal",
                  fontFamily: poppins.style.fontFamily,
                  marginBottom: "1.5rem",
                }}
              >
                {section.subtitle || "Question"}
              </Typography>

              <TextField
                multiline
                fullWidth
                minRows={5}
                placeholder="Type your thoughts..."
                variant="standard"
                value={section.content}
                onChange={(e) =>
                  handleSectionChange(index, "content", e.target.value)
                }
                InputProps={{
                  disableUnderline: true,
                  style: {
                    fontStyle: section.content ? "normal" : "italic",
                    fontSize: "1rem",
                    color: "#4A3E8E",
                    fontFamily: poppins.style.fontFamily,
                  },
                }}
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  marginBottom: "1.5rem",
                }}
              />
            </Box>
          ))}

          {showButton && (
            <Box
              width="100%"
              display="flex"
              bgcolor="#fff"
              py={3}
              zIndex={10}
              mb={2}
            >
              <Button
                variant="contained"
                onClick={handleGoDeeper}
                sx={{
                  backgroundColor: "#4E2BBD",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: "16px",
                  padding: "0.95rem 2rem",
                  boxShadow: "none",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    fontWeight: 400,
                    fontSize: "1.1rem",
                  }}
                >
                  Go Deeper
                </Typography>
              </Button>

              <Button
                variant="contained"
                onClick={handleFinishEntry}
                sx={{
                  backgroundColor: "#E2DDF9",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: "16px",
                  padding: "0.95rem 3.5rem",
                  boxShadow: "none",
                  marginLeft: "1.2rem",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    fontWeight: 400,
                    fontSize: "1.1rem",
                    color: "#4E2BBD",
                  }}
                >
                  Finish Entry
                </Typography>
              </Button>
            </Box>
          )}
        </Box>

        {/* Suggestion Button (fixed at bottom of screen) - FIXED VERSION */}
        {!content && (
          <Box
            position="fixed"
            bottom={0}
            left={0}
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="#fff"
            py={{ xs: 2, sm: 3 }}
            px={{ xs: 2, sm: 4 }}
            zIndex={10}
          >
            <Button
              variant="contained"
              onClick={handleSuggestionsClick}
              sx={{
                backgroundColor: "#E2DDF9",
                color: "#4E2BBD",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "12px",
                padding: {
                  xs: "0.95rem 1.5rem",
                  sm: "0.95rem 1.5rem",
                  md: "0.95rem 2rem",
                },
                boxShadow: "none",
                maxWidth: { xs: "600px", sm: "600px", md: "600px" },
                width: "fit-content",
                minWidth: { xs: "280px", sm: "auto", md: "auto" },
                "&:hover": {
                  backgroundColor: "#D4C7F3",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 400,
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Having a hard time? Don't worry, try our suggestions.
              </Typography>
            </Button>
          </Box>
        )}

        {/* Exit Confirmation Dialog */}
        <ExitConfirmationDialog
          open={showExitDialog}
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
        />
      </Box>
    </>
  );
}
