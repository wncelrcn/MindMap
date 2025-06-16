// pages/view-insights/index.js - Updated with improved design consistency
import {
  Box,
  Container,
  Typography,
  useTheme,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/navbar";
import InsightSection from "@/components/InsightSection";
import { useState, useEffect } from "react";
import { Poppins, Raleway, Quicksand } from "next/font/google";
import { createClient } from "@/utils/supabase/server-props";
import Head from "next/head";
import { useRouter } from "next/router";

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

export default function ViewInsights({ user }) {
  const [username, setUsername] = useState(user.user_metadata.name);
  const [user_UID, setUser_UID] = useState(user.id);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [hideDisclaimer, setHideDisclaimer] = useState(false);

  const router = useRouter();
  const { journalId, journalType } = router.query;

  useEffect(() => {
    // Check if user has chosen to hide disclaimer
    const shouldHideDisclaimer =
      localStorage.getItem("hideInsightsDisclaimer") === "true";
    setHideDisclaimer(shouldHideDisclaimer);

    // Show disclaimer if user hasn't chosen to hide it
    if (!shouldHideDisclaimer) {
      setDisclaimerOpen(true);
    }
  }, []);

  useEffect(() => {
    if (journalId && journalType) {
      loadInsights();
    } else {
      // If no specific journal is selected, show message to select a journal
      setLoading(false);
      setError("Please select a journal entry to view insights.");
    }
  }, [journalId, journalType]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/analyze-journal/journal_insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user_UID,
          journalId: journalId,
          journalType: journalType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load insights");
      }

      setInsights(data.insights);
      setSnackbar({
        open: true,
        message: "Insights loaded successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error loading insights:", err);
      setError(err.message || "Failed to load insights");
      setSnackbar({
        open: true,
        message: "Error loading insights. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateInsights = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch("/api/analyze-journal/journal_insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user_UID,
          journalId: journalId,
          journalType: journalType,
          forceRegenerate: true, // Force regeneration
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate insights");
      }

      setInsights(data.insights);
      setSnackbar({
        open: true,
        message: "Insights regenerated successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error regenerating insights:", err);
      setSnackbar({
        open: true,
        message: "Error regenerating insights. Please try again.",
        severity: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDisclaimerToggle = (event) => {
    setHideDisclaimer(event.target.checked);
  };

  const handleUnderstandClick = () => {
    // Save preference to localStorage only if user has chosen to hide
    if (hideDisclaimer) {
      localStorage.setItem("hideInsightsDisclaimer", "true");
    } else {
      localStorage.removeItem("hideInsightsDisclaimer");
    }
    setDisclaimerOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  const getEmptyStateMessage = (type) => {
    const messages = {
      dominant_emotions:
        "Your emotional landscape is unique and still unfolding. Every feeling, no matter how subtle, contributes to your personal growth journey.",
      strengths:
        "Your inner strengths are always present, even when they're not immediately visible. Trust in your resilience and capacity for growth.",
      emotional_intensity:
        "Your emotional experience is valid and meaningful, regardless of its intensity. Both quiet moments and powerful feelings contribute to your personal understanding.",
    };
    return (
      messages[type] ||
      "Your emotional journey is unique and meaningful. Trust in your process of self-discovery."
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
            flexDirection: "column",
            gap: 3,
            padding: { xs: "2rem 1rem", md: "4rem" },
          }}
        >
          <Box
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: "4px",
                borderRadius: "50%",
                background: "white",
                zIndex: 1,
              },
            }}
          >
            <CircularProgress
              size={60}
              sx={{
                color: "#2D1B6B",
                zIndex: 2,
                position: "relative",
              }}
            />
          </Box>

          <Box sx={{ textAlign: "center", maxWidth: "400px" }}>
            <Typography
              variant="h5"
              sx={{
                color: "#2D1B6B",
                fontFamily: poppins.style.fontFamily,
                fontWeight: 600,
                mb: 2,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              }}
            >
              Analyzing Your Journey
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontFamily: poppins.style.fontFamily,
                lineHeight: 1.6,
                fontSize: { xs: "0.9rem", sm: "1rem" },
              }}
            >
              We're carefully examining your journal entry to provide meaningful
              insights that support your personal growth and self-reflection.
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  if (error && !insights) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error" variant="h6" sx={{ mb: 2 }}>
            {error}
          </Typography>
          {journalId && journalType && (
            <Button variant="contained" onClick={loadInsights} sx={{ mr: 2 }}>
              Try Again
            </Button>
          )}
          <Button variant="outlined" component={Link} href="/view-journal">
            Back to Journal
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>View Insights</title>
        <meta
          name="description"
          content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

      <Navbar />

      {/* Disclaimer Dialog */}
      <Dialog
        open={disclaimerOpen}
        onClose={() => {}} // Empty function to prevent closing on backdrop click
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
            The insights provided by MindMap are generated using AI based on
            your journal entry and are intended to support self-reflection and
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
            These insights do not constitute psychological diagnosis,
            professional advice, or therapy. If you are experiencing distress or
            need mental health support, please contact a licensed mental health
            professional.
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={hideDisclaimer}
                onChange={handleDisclaimerToggle}
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
              "& .MuiFormControlLabel-label": {
                fontSize: "0.9rem",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleUnderstandClick}
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

      {/* Header with image */}
      <Box position="relative" width="100%" height={{ xs: "50px", md: "70px" }}>
        <Box
          position="absolute"
          top={16}
          zIndex={1}
          sx={{
            padding: {
              xs: "1rem",
              sm: "1.5rem",
              md: "2rem 4rem",
              lg: "2rem 8rem",
            },
          }}
        >
          <Link href="/view-journal" passHref legacyBehavior>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#2D1B6B"
                style={{ cursor: "pointer" }}
              >
                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
              </svg>
            </a>
          </Link>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          padding: {
            xs: "1.5rem 1rem",
            sm: "2rem 1.5rem",
            md: "3rem 4rem",
            lg: "3rem 8rem",
          },
          paddingBottom: { xs: "4rem", sm: "6rem", md: "8rem" },
          marginBottom: { xs: "2rem", sm: "3rem", md: "4rem" },
        }}
      >
        {/* Page Title */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                fontWeight: 400,
                color: "#2D1B6B",
                lineHeight: "normal",
                fontFamily: poppins.style.fontFamily,
                mb: 1,
                letterSpacing: "0.5px",
              }}
            >
              Journal
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "2rem",
                  sm: "2.5rem",
                  md: "3rem",
                  lg: "3.5rem",
                },
                fontWeight: 700,
                color: "#2D1B6B",
                lineHeight: "1.1",
                fontFamily: poppins.style.fontFamily,
                mb: { xs: 1, sm: 2 },
              }}
            >
              Insights
            </Typography>

            {insights && (
              <Typography
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  color: "#666",
                  fontFamily: poppins.style.fontFamily,
                }}
              >
                Generated on {formatDate(insights.created_at)}
              </Typography>
            )}
          </Box>

          {insights && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Info Icon Button */}
              <IconButton
                onClick={() => setDisclaimerOpen(true)}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  color: "#2D1B6B",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(45, 27, 107, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <InfoIcon sx={{ fontSize: 18 }} />
              </IconButton>

              {/* Refresh Button */}
              <Box
                sx={{
                  background: generating
                    ? "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "16px",
                  padding: "1px",
                  cursor: generating ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: generating ? "none" : "translateY(-2px)",
                    boxShadow: generating
                      ? "none"
                      : "0 8px 25px rgba(102, 126, 234, 0.3)",
                  },
                }}
              >
                <Button
                  onClick={regenerateInsights}
                  disabled={generating}
                  sx={{
                    background: "white",
                    color: generating ? "#999" : "#2D1B6B",
                    borderRadius: "15px",
                    textTransform: "none",
                    fontFamily: poppins.style.fontFamily,
                    fontWeight: 500,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.25 },
                    minWidth: "auto",
                    border: "none",
                    "&:hover": {
                      background: "white",
                      border: "none",
                    },
                    "&:disabled": {
                      background: "white",
                      color: "#999",
                    },
                  }}
                >
                  {generating ? (
                    <>
                      <CircularProgress
                        size={16}
                        sx={{
                          mr: 1,
                          color: "#999",
                        }}
                      />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginRight: "8px" }}
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                      Refresh Insights
                    </>
                  )}
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {insights && (
          <>
            {/* Insights Header Cards */}
            <Box sx={{ mb: { xs: 6, sm: 8, md: 10, lg: 12 } }}>
              {/* Top Row - 2 Cards */}
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 2, sm: 2.5, md: 3 },
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  flexDirection: { xs: "column", sm: "column", md: "row" },
                }}
              >
                {/* Card 1 - Top Left - Resilience Insight */}
                <Card
                  sx={{
                    flex: { md: "0 0 75%" },
                    width: { xs: "100%", md: "75%" },
                    height: { xs: 200, sm: 220, md: 260, lg: 280 },
                    border: "1px solid black",
                    borderRadius: { xs: "16px", sm: "18px", md: "20px" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage: "url('/assets/insights/bg-topleft.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    order: { xs: 1, md: 1 },
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "left",
                      padding: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                      zIndex: 1,
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.95rem",
                          sm: "1.05rem",
                          md: "1.2rem",
                          lg: "1.3rem",
                        },
                        fontWeight: 400,
                        textAlign: "left",
                        color: "#1565C0",
                        lineHeight: "1.4",
                        fontFamily: poppins.style.fontFamily,
                        maxWidth: "100%",
                      }}
                    >
                      {insights.header_insights.resilience_insight}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Card 2 - Top Right - Primary Motivation */}
                <Card
                  sx={{
                    flex: { md: "0 0 25%" },
                    width: { xs: "100%", md: "25%" },
                    height: { xs: 120, sm: 140, md: 260, lg: 280 },
                    border: "1px solid black",
                    borderRadius: { xs: "16px", sm: "18px", md: "20px" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage: "url('/assets/insights/bg-topright.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    order: { xs: 2, md: 2 },
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      padding: {
                        xs: "1rem 1.5rem",
                        sm: "1rem 1.75rem",
                        md: "1rem 2rem 2rem 2rem",
                      },
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.2rem",
                          sm: "1.3rem",
                          md: "1.4rem",
                          lg: "1.5rem",
                        },
                        fontWeight: 600,
                        color: "#2E7D32",
                        fontFamily: poppins.style.fontFamily,
                      }}
                    >
                      {insights.header_insights.primary_motivation}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Bottom Row - 2 Cards */}
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 2, sm: 2.5, md: 3 },
                  flexDirection: { xs: "column", sm: "column", md: "row" },
                }}
              >
                {/* Card 3 - Bottom Left - Growth Indicator */}
                <Card
                  sx={{
                    flex: { md: "0 0 25%" },
                    width: { xs: "100%", md: "25%" },
                    height: { xs: 120, sm: 140, md: 260, lg: 280 },
                    border: "1px solid black",
                    borderRadius: { xs: "16px", sm: "18px", md: "20px" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage:
                      "url('/assets/insights/bg-bottomleft.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    order: { xs: 3, md: 1 },
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                      padding: {
                        xs: "1rem 1.5rem",
                        sm: "1rem 1.75rem",
                        md: "1rem 2rem 2rem 2rem",
                      },
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.2rem",
                          sm: "1.3rem",
                          md: "1.4rem",
                          lg: "1.5rem",
                        },
                        fontWeight: 600,
                        color: "#E65100",
                        fontFamily: poppins.style.fontFamily,
                      }}
                    >
                      {insights.header_insights.growth_indicator}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Card 4 - Bottom Right - Emotional Tone */}
                <Card
                  sx={{
                    flex: { md: "0 0 75%" },
                    width: { xs: "100%", md: "75%" },
                    height: { xs: 200, sm: 220, md: 260, lg: 280 },
                    border: "1px solid black",
                    borderRadius: { xs: "16px", sm: "18px", md: "20px" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage:
                      "url('/assets/insights/bg-bottomright.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    order: { xs: 4, md: 2 },
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "right",
                      padding: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                      zIndex: 1,
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.95rem",
                          sm: "1.05rem",
                          md: "1.2rem",
                          lg: "1.3rem",
                        },
                        fontWeight: 400,
                        color: "#6A1B9A",
                        lineHeight: "1.4",
                        fontFamily: poppins.style.fontFamily,
                        maxWidth: "100%",
                        textAlign: { xs: "left", md: "right" },
                      }}
                    >
                      {insights.header_insights.emotional_tone}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Insights Content */}
            <InsightSection
              title="Your Personalized Well-being"
              subtitle="Actionable advice based on dominant emotions and trends."
              imageSrc="/assets/people/person-7.png"
              mainText={insights.wellbeing_insights.main_observation}
              imagePosition="left"
              additionalContent={insights.wellbeing_insights.actionable_advice}
            />

            <InsightSection
              title="Coping Strategies"
              subtitle="Tailored strategies to manage specific emotions."
              imageSrc="/assets/people/person-9.png"
              mainText={insights.coping_strategies.main_observation}
              imagePosition="right"
              additionalContent={
                insights.coping_strategies.recommended_strategies
              }
            />

            <InsightSection
              title="Goal Setting"
              subtitle="Personalized goals to improve emotional well-being."
              imageSrc="/assets/people/person-8.png"
              mainText={insights.goals.main_observation}
              imagePosition="left"
              additionalContent={insights.goals.suggested_goals}
            />

            {/* Emotional Data Summary - Redesigned */}
            <Box sx={{ mt: 8, mb: 4 }}>
              <Card
                sx={{
                  borderRadius: "20px",
                  border: "1px solid #e0e0e0",
                  background: "linear-gradient(135deg, #f8f9ff 0%, #fff 100%)",
                  boxShadow: "0 4px 20px rgba(45, 27, 107, 0.08)",
                  overflow: "hidden",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background:
                      "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: poppins.style.fontFamily,
                        color: "#2D1B6B",
                        fontWeight: 600,
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      }}
                    >
                      Emotional Overview
                    </Typography>
                  </Box>

                  <Grid container spacing={4}>
                    {/* Dominant Emotions */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            mb: 2,
                            color: "#2D1B6B",
                            fontFamily: poppins.style.fontFamily,
                            fontWeight: 600,
                            fontSize: "1.1rem",
                          }}
                        >
                          Dominant Emotions
                        </Typography>
                        {insights.emotional_data.dominant_emotions &&
                        insights.emotional_data.dominant_emotions.length > 0 ? (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}
                          >
                            {insights.emotional_data.dominant_emotions.map(
                              (emotion, index) => (
                                <Chip
                                  key={index}
                                  label={emotion}
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                    color: "#1565c0",
                                    fontFamily: poppins.style.fontFamily,
                                    fontWeight: 500,
                                    borderRadius: "12px",
                                    px: 1,
                                    py: 0.5,
                                    border: "1px solid #90caf9",
                                    "&:hover": {
                                      background:
                                        "linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)",
                                    },
                                  }}
                                />
                              )
                            )}
                          </Box>
                        ) : (
                          <Typography
                            sx={{
                              color: "#666",
                              fontStyle: "italic",
                              fontFamily: poppins.style.fontFamily,
                              lineHeight: 1.6,
                              p: 2,
                              backgroundColor: "#f8f9fa",
                              borderRadius: "12px",
                              border: "1px dashed #ddd",
                            }}
                          >
                            {getEmptyStateMessage("dominant_emotions")}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Strengths */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            mb: 2,
                            color: "#2D1B6B",
                            fontFamily: poppins.style.fontFamily,
                            fontWeight: 600,
                            fontSize: "1.1rem",
                          }}
                        >
                          Personal Strengths
                        </Typography>
                        {insights.emotional_data.strengths &&
                        insights.emotional_data.strengths.length > 0 ? (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}
                          >
                            {insights.emotional_data.strengths.map(
                              (strength, index) => (
                                <Chip
                                  key={index}
                                  label={strength}
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                                    color: "#2e7d32",
                                    fontFamily: poppins.style.fontFamily,
                                    fontWeight: 500,
                                    borderRadius: "12px",
                                    px: 1,
                                    py: 0.5,
                                    border: "1px solid #a5d6a7",
                                    "&:hover": {
                                      background:
                                        "linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)",
                                    },
                                  }}
                                />
                              )
                            )}
                          </Box>
                        ) : (
                          <Typography
                            sx={{
                              color: "#666",
                              fontStyle: "italic",
                              fontFamily: poppins.style.fontFamily,
                              lineHeight: 1.6,
                              p: 2,
                              backgroundColor: "#f8f9fa",
                              borderRadius: "12px",
                              border: "1px dashed #ddd",
                            }}
                          >
                            {getEmptyStateMessage("strengths")}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Emotional Intensity */}
                  <Box sx={{ mt: 4, pt: 4, borderTop: "1px solid #f0f0f0" }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 2,
                        color: "#2D1B6B",
                        fontFamily: poppins.style.fontFamily,
                        fontWeight: 600,
                        fontSize: "1.1rem",
                      }}
                    >
                      Emotional Intensity
                    </Typography>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: "16px",
                        background:
                          "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                        border: "1px solid #ffcc02",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#ef6c00",
                          fontFamily: poppins.style.fontFamily,
                          lineHeight: 1.6,
                          fontSize: "1rem",
                          fontWeight: 500,
                        }}
                      >
                        {insights.emotional_data.emotional_intensity ||
                          getEmptyStateMessage("emotional_intensity")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: "12px",
            fontFamily: poppins.style.fontFamily,
            "& .MuiAlert-icon": {
              fontSize: "1.2rem",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
