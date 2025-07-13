import Navbar from "@/components/layout/navbar";
import LoadingModal from "@/components/LoadingModal";
import {
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { requireAuth } from "@/lib/requireAuth";
import { useRouter } from "next/router";
import { Poppins, Quicksand } from "next/font/google";
import { createClient } from "@/utils/supabase/server-props";
import Loading from "@/components/Loading";
import { useTypingDetection } from "@/hooks/useTypingDetection";
import ExitConfirmationDialog, {
  useExitConfirmation,
} from "@/components/ExitConfirmationDialog";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
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

export default function Questions({ user }) {
  const router = useRouter();
  const { theme, category } = router.query;
  const [title, setTitle] = useState(`${category || "Journal"} Entry`);
  const [editingTitle, setEditingTitle] = useState(false);
  const [questionSet, setQuestionSet] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [user_UID, setUser_UID] = useState(user.id);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [themeId, setThemeId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [questionSetId, setQuestionSetId] = useState(null);
  const [openShortEntryDialog, setOpenShortEntryDialog] = useState(false);

  // Loading states for insights generation
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [progress, setProgress] = useState(0);

  // Use the custom typing detection hook
  const { showButtons, handleTyping, hideButtons } = useTypingDetection(
    answers[`question${currentQuestionIndex + 1}`]
  );

  // Use the exit confirmation hook
  const {
    showExitDialog,
    handleConfirmExit,
    handleCancelExit,
    handleCustomExit,
  } = useExitConfirmation(hasChanges, () => setHasChanges(false));

  useEffect(() => {
    const fetchQuestionSet = async () => {
      if (!theme || !category) return;

      try {
        // Fetch the question sets from the API endpoint
        const response = await fetch(
          `/api/create-journal/question_set?theme=${theme}&category=${category}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch question sets");
        }
        const { themeId, categoryId, question_sets } = await response.json();

        setThemeId(themeId);
        setCategoryId(categoryId);

        if (!question_sets.length) {
          throw new Error("No question sets found for this category.");
        }

        // Randomly select one question set from the available sets
        const randomSetIndex = Math.floor(Math.random() * question_sets.length);
        const selectedSet = question_sets[randomSetIndex];

        setQuestionSetId(selectedSet.id);

        // Extract questions correctly based on the actual structure
        let questions = [];
        if (
          selectedSet.questions &&
          Array.isArray(selectedSet.questions.questions)
        ) {
          questions = selectedSet.questions.questions;
        } else if (
          selectedSet.questions &&
          typeof selectedSet.questions === "object"
        ) {
          questions = selectedSet.questions.questions || [];
        } else if (Array.isArray(selectedSet.questions)) {
          questions = selectedSet.questions;
        }

        setQuestionSet(questions);
        setAnswers(
          questions.reduce(
            (acc, _, index) => ({
              ...acc,
              [`question${index + 1}`]: "",
            }),
            {}
          )
        );
      } catch (err) {
        console.error("Error fetching question set:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionSet();
  }, [theme, category]);

  useEffect(() => {
    const checkForChanges = () => {
      const hasAnswer = Object.values(answers).some(
        (answer) => answer.trim() !== ""
      );
      setHasChanges(hasAnswer);
    };

    checkForChanges();
  }, [answers]);

  const handleTitleClick = () => setEditingTitle(true);
  const handleTitleBlur = () => {
    if (title.trim() === "") {
      setTitle(`${category || "Journal"} Entry`);
    }
    setEditingTitle(false);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [`question${index + 1}`]: value,
    }));
    handleTyping();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionSet.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      hideButtons();
    }
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
      // Check if at least one answer is provided
      const hasContent = Object.values(answers).some((answer) => answer.trim());
      if (!hasContent) {
        setError("Please answer at least one question before saving.");
        return;
      }

      const fullText = Object.values(answers)
        .map((a) => a.trim())
        .join(" ");
      const wordCount = fullText.split(/\s+/).filter(Boolean).length;

      if (wordCount < 30) {
        setOpenShortEntryDialog(true);
        return;
      }

      // Start loading
      setIsGeneratingInsights(true);
      setProgress(0);
      setLoadingStep("Preparing your guided journal...");

      // Create a structured journalData array with ordered questions and answers
      const journalData = [];
      questionSet.forEach((question, index) => {
        if (answers[`question${index + 1}`]?.trim()) {
          journalData.push({
            question,
            answer: answers[`question${index + 1}`].trim(),
          });
        }
      });

      setProgress(20);
      setLoadingStep("Analyzing your thoughts and emotions...");

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
        console.warn("Emotions analysis failed:", emotionsData.message);
        // Continue without emotions data rather than failing completely
      }

      setProgress(75);
      setLoadingStep("Saving your journal entry...");

      // Create the journal entry
      const res = await fetch("/api/create-journal/guided", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_UID: user_UID,
          theme_id: themeId,
          category_id: categoryId,
          question_set_id: questionSetId,
          journal_entry: journalData,
          title: title.trim() || "Untitled Entry",
          journal_summary: summaryData["summary"],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
              journal_type: "guided",
              theme: summaryData["theme"],
            }),
          });
        } catch (emotionError) {
          console.warn("Failed to save emotions data:", emotionError);
          // Don't fail the entire operation if emotions saving fails
        }
      }

      setProgress(100);
      setLoadingStep("Complete! Redirecting...");

      // Small delay to show completion
      setTimeout(() => {
        setIsGeneratingInsights(false);
        setHasChanges(false); // Reset to prevent exit dialog
        router.push("/dashboard?completed=true");
      }, 1000);
    } catch (error) {
      setIsGeneratingInsights(false);
      setError(error.message);
      console.error("Error creating journal entry:", error);
    }
  };

  // Custom back button handler
  const handleBackButtonClick = () => {
    handleCustomExit(
      `/guided-journaling/${theme}/${encodeURIComponent(category)}`
    );
  };

  // Display additional debugging information when there's an error
  if (loading) return <Loading />;

  return (
    <>
      <Head>
        <title>Create a Guided Journal Entry</title>
        <meta
          name="description"
          content={`Answer guided questions for ${category} under ${theme}.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

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
            {/* Custom back button that triggers our handler */}
            <div onClick={handleBackButtonClick} style={{ cursor: "pointer" }}>
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
            <TextField
              fullWidth
              value={title || ""}
              placeholder={`${category || "Journal"} Entry`}
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

          {/* Display all questions up to the current index */}
          {questionSet
            .slice(0, currentQuestionIndex + 1)
            .map((question, index) => (
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
                  {question}
                </Typography>

                <TextField
                  multiline
                  fullWidth
                  minRows={5}
                  placeholder="Type your thoughts..."
                  variant="standard"
                  value={answers[`question${index + 1}`] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    style: {
                      fontStyle: answers[`question${index + 1}`]
                        ? "normal"
                        : "italic",
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

          {currentQuestionIndex < questionSet.length - 1 && showButtons && (
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
                onClick={handleNextQuestion}
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
                  Next Question
                </Typography>
              </Button>

              <Button
                variant="contained"
                onClick={handleFinishEntry}
                sx={{
                  backgroundColor: "#E2DDF9",
                  color: "#4E2BBD",
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
                  }}
                >
                  Finish Entry
                </Typography>
              </Button>
            </Box>
          )}

          {currentQuestionIndex === questionSet.length - 1 && showButtons && (
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
                onClick={handleFinishEntry}
                sx={{
                  backgroundColor: "#E2DDF9",
                  color: "#4E2BBD",
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: "16px",
                  padding: "0.95rem 3.5rem",
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
                  Finish Entry
                </Typography>
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Exit Confirmation Dialog */}
      <ExitConfirmationDialog
        open={showExitDialog}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />

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
            Your answers seem a bit short to generate meaningful insights. We
            recommend writing a bit more to get the best results.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "0 1rem 1rem" }}>
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
    </>
  );
}
