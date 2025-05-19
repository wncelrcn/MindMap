import Navbar from "@/components/navbar";
import {
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { requireAuth } from "@/lib/requireAuth";
import { useRouter } from "next/router";
import { Poppins, Quicksand } from "next/font/google";
import { supabase } from "@/lib/supabase";

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
  return await requireAuth(context.req);
}

export default function Questions({ user }) {
  const router = useRouter();
  const { theme, category } = router.query; // Get theme and category from URL
  const [title, setTitle] = useState(`${category || "Journal"} Entry`);
  const [editingTitle, setEditingTitle] = useState(false);
  const [questionSet, setQuestionSet] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [userId, setUserId] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showButtons, setShowButtons] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitDestination, setExitDestination] = useState(null);
  const [themeId, setThemeId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [questionSetId, setQuestionSetId] = useState(null);

  useEffect(() => {
    const fetchQuestionSet = async () => {
      if (!theme || !category) return;

      try {
        // Fetch the theme, category, and its question sets from Supabase
        const { data, error } = await supabase
          .from("themes")
          .select(
            `
            id,
            name,
            categories (
              id,
              name,
              question_sets (
                id,
                set_name,
                questions
              )
            )
          `
          )
          .eq("name", theme)
          .eq("categories.name", category)
          .single();

        if (error) throw error;

        // Store theme ID for later use
        setThemeId(data.id);

        const selectedCategory = data.categories.find(
          (cat) => cat.name === category
        );
        if (!selectedCategory || !selectedCategory.question_sets.length) {
          throw new Error("No question sets found for this category.");
        }

        // Store category ID for later use
        setCategoryId(selectedCategory.id);

        // Randomly select one question set from the available sets
        const randomSetIndex = Math.floor(
          Math.random() * selectedCategory.question_sets.length
        );
        const selectedSet = selectedCategory.question_sets[randomSetIndex];

        // Store question set ID for later use
        setQuestionSetId(selectedSet.id);

        // Debug to understand the structure of the data
        console.log("Selected set:", selectedSet);

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
          // Handle case where questions might be directly in the object
          questions = selectedSet.questions.questions || [];
        } else if (Array.isArray(selectedSet.questions)) {
          questions = selectedSet.questions;
        }

        // Set the questions and initialize answers
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
    const timer = setTimeout(() => {
      if (
        Date.now() - lastActivity >= 2000 &&
        answers[`question${currentQuestionIndex + 1}`]
      ) {
        setShowButtons(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [lastActivity, answers, currentQuestionIndex]);

  useEffect(() => {
    setUserId(user.user_id);
  }, [user]);

  // Check if there are any answers entered
  useEffect(() => {
    const checkForChanges = () => {
      const hasAnswer = Object.values(answers).some(
        (answer) => answer.trim() !== ""
      );
      setHasChanges(hasAnswer);
    };

    checkForChanges();
  }, [answers]);

  // Setup the navigation warning
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
    setLastActivity(Date.now());
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionSet.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowButtons(false);
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

      console.log("Saving journal entry:", {
        user_id: userId,
        theme_id: themeId,
        category_id: categoryId,
        question_set_id: questionSetId,
        journal_entry: journalData,
        title: title.trim() || "Untitled Entry",
      });

      // First try direct Supabase insertion if API route is not yet implemented
      try {
        const { data, error } = await supabase
          .from("guided_journaling_table")
          .insert({
            user_id: userId,
            theme_id: themeId,
            category_id: categoryId,
            question_set_id: questionSetId,
            journal_entry: journalData,
            title: title.trim() || "Untitled Entry",
            date_created: new Date().toISOString().split("T")[0],
            time_created: new Date().toTimeString().split(" ")[0],
          })
          .select();

        if (error) throw error;

        // Reset hasChanges to prevent the warning dialog
        setHasChanges(false);
        router.push("/dashboard?completed=true");
        return;
      } catch (directDbError) {
        console.log(
          "Direct DB insertion failed, trying API route",
          directDbError
        );
        // Continue to API route if direct insertion fails
      }

      // Add the API endpoint for guided journaling
      const res = await fetch("/api/create-journal/guided", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          theme_id: themeId,
          category_id: categoryId,
          question_set_id: questionSetId,
          journal_entry: journalData,
          title: title.trim() || "Untitled Entry",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create entry");
      }

      // Reset hasChanges to prevent the warning dialog
      setHasChanges(false);
      router.push("/dashboard?completed=true");
    } catch (error) {
      setError(error.message);
      console.error("Error creating journal entry:", error);
    }
  };

  // Handle user confirmation to leave
  const handleConfirmExit = () => {
    setHasChanges(false); // Reset the flag to prevent future dialogs
    setShowExitDialog(false);
    // Navigate to the destination
    if (exitDestination) {
      router.push(exitDestination);
    } else {
      // If no specific destination (e.g., when using browser back button)
      router.back();
    }
  };

  // Handle user decision to stay on the page
  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  // Custom back button handler
  const handleBackButtonClick = () => {
    if (hasChanges) {
      setExitDestination(
        `/guided-journaling/${theme}/${encodeURIComponent(category)}`
      );
      setShowExitDialog(true);
    } else {
      router.push(
        `/guided-journaling/${theme}/${encodeURIComponent(category)}`
      );
    }
  };

  // Display additional debugging information when there's an error
  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.back()}
          sx={{ mt: 2, backgroundColor: "#4E2BBD" }}
        >
          Go Back
        </Button>
        {process.env.NODE_ENV !== "production" && (
          <Box
            sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
          >
            <Typography variant="subtitle2">Debug Info:</Typography>
            <Typography variant="body2">Theme: {theme}</Typography>
            <Typography variant="body2">Category: {category}</Typography>
            <Typography variant="body2">Theme ID: {themeId}</Typography>
            <Typography variant="body2">Category ID: {categoryId}</Typography>
          </Box>
        )}
      </Box>
    );
  if (!questionSet.length)
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          No questions available for this category.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.back()}
          sx={{ mt: 2, backgroundColor: "#4E2BBD" }}
        >
          Go Back
        </Button>
        {process.env.NODE_ENV !== "production" && (
          <Box
            sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
          >
            <Typography variant="subtitle2">Debug Info:</Typography>
            <Typography variant="body2">Theme: {theme}</Typography>
            <Typography variant="body2">Category: {category}</Typography>
            <Typography variant="body2">Theme ID: {themeId}</Typography>
            <Typography variant="body2">Category ID: {categoryId}</Typography>
            <Typography variant="body2">
              QuestionSet: {JSON.stringify(questionSet)}
            </Typography>
          </Box>
        )}
      </Box>
    );

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
      <Dialog
        open={showExitDialog}
        onClose={handleCancelExit}
        aria-labelledby="exit-dialog-title"
        aria-describedby="exit-dialog-description"
      >
        <DialogTitle
          id="exit-dialog-title"
          sx={{
            fontFamily: poppins.style.fontFamily,
            fontWeight: 600,
            color: "#2D1B6B",
          }}
        >
          Unsaved Changes
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "#4A3E8E",
            }}
          >
            You have unsaved content in your journal entry. Leaving this page
            will cause your work to be lost. Are you sure you want to leave?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "1rem" }}>
          <Button
            onClick={handleCancelExit}
            sx={{
              backgroundColor: "#E2DDF9",
              color: "#4E2BBD",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "16px",
              padding: "0.75rem 1.5rem",
              boxShadow: "none",
              fontFamily: poppins.style.fontFamily,
            }}
          >
            Stay on Page
          </Button>
          <Button
            onClick={handleConfirmExit}
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
            }}
          >
            Leave Without Saving
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
