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
import DisclaimerModal from "@/components/disclaimer/DisclaimerModal";
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
        <Head>
          <title>Analyzing Your Insights</title>
          <meta
            name="description"
            content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/assets/logo.png" />
        </Head>
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
      <DisclaimerModal
        open={disclaimerOpen}
        hideDisclaimer={hideDisclaimer}
        onDisclaimerToggle={handleDisclaimerToggle}
        onUnderstandClick={handleUnderstandClick}
      />

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
        {/* Page Title - Improved Responsive Design */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "flex-start" },
            gap: { xs: 3, sm: 3, md: 2 },
            mb: 4,
          }}
        >
          {/* Title Section */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
                wordBreak: "break-word", // Prevent overflow on small screens
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

          {/* Buttons Section */}
          {insights && (
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                gap: { xs: 1.5, sm: 2 },
                flexShrink: 0,
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "flex-start", md: "flex-end" },
                flexWrap: { xs: "wrap", sm: "nowrap" },
              }}
            >
              {/* Info Icon Button */}
              <IconButton
                onClick={() => setDisclaimerOpen(true)}
                sx={{
                  height: { xs: 37, sm: 40 },
                  backgroundColor: "#ffffff",
                  border: "1px solid #764ba2",
                  borderRadius: "12px",
                  color: "#2D1B6B",
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 500,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1.5, sm: 2, md: 2.5 },
                  minWidth: { xs: "auto", sm: "120px" },
                  "&:hover": {
                    transform: "translateY(-1px)",
                    background: "white",
                    border: "1px solid #764ba2",
                    boxShadow: "0 4px 12px rgba(118, 75, 162, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <InfoIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                <Typography
                  sx={{
                    display: { xs: "none", sm: "block" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 500,
                    color: "#2D1B6B",
                    ml: 1,
                    fontFamily: poppins.style.fontFamily,
                  }}
                >
                  Information
                </Typography>
              </IconButton>

              {/* Refresh Button */}
              <Box
                sx={{
                  borderRadius: "12px",
                  border: "1px solid #764ba2",
                  padding: "1px",
                  cursor: generating ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  height: { xs: 37, sm: 40 },
                  "&:hover": {
                    transform: generating ? "none" : "translateY(-1px)",
                    boxShadow: generating
                      ? "none"
                      : "0 4px 12px rgba(118, 75, 162, 0.15)",
                  },
                }}
              >
                <Button
                  onClick={regenerateInsights}
                  disabled={generating}
                  sx={{
                    background: "white",
                    color: generating ? "#999" : "#2D1B6B",
                    borderRadius: "11px",
                    textTransform: "none",
                    fontFamily: poppins.style.fontFamily,
                    fontWeight: 500,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1.5, sm: 2, md: 3 },
                    height: "100%",
                    minWidth: { xs: "auto", sm: "160px" },
                    border: "none",
                    whiteSpace: "nowrap",
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress
                        size={16}
                        sx={{
                          color: "#999",
                        }}
                      />
                      <Typography
                        sx={{
                          display: { xs: "none", sm: "block" },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          fontWeight: 500,
                          color: "#999",
                          fontFamily: poppins.style.fontFamily,
                        }}
                      >
                        Regenerating...
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                      <Typography
                        sx={{
                          display: { xs: "none", sm: "block" },
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          fontWeight: 500,
                          color: "#2D1B6B",
                          fontFamily: poppins.style.fontFamily,
                        }}
                      >
                        Refresh Insights
                      </Typography>
                    </Box>
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
                    minHeight: { xs: 160, sm: 180, md: 260, lg: 280 },
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
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.9rem",
                          sm: "1rem",
                          md: "1.2rem",
                          lg: "1.3rem",
                        },
                        fontWeight: 400,
                        textAlign: "left",
                        color: "#1565C0",
                        lineHeight: "1.4",
                        fontFamily: poppins.style.fontFamily,
                        maxWidth: "100%",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        hyphens: "auto",
                      }}
                    >
                      {insights.header_insights.resilience_insight}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Card 2 - Top Right - Primary Motivation (GREEN) */}
                <Card
                  sx={{
                    flex: { md: "0 0 25%" },
                    width: { xs: "100%", md: "25%" },
                    minHeight: { xs: 120, sm: 140, md: 260, lg: 280 },
                    border: "1px solid black",
                    borderRadius: { xs: "16px", sm: "18px", md: "20px" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: { xs: "center", md: "flex-end" },
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage: {
                      xs: "url('/assets/insights/bg-topright-small.png')",
                      md: "url('/assets/insights/bg-topright.png')",
                    },
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
                      height: { xs: "100%", md: "auto" },
                      display: { xs: "flex", md: "block" },
                      alignItems: { xs: "center", md: "normal" },
                      justifyContent: { xs: "center", md: "normal" },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.4rem", // Increased from 1.1rem
                          sm: "1.5rem", // Increased from 1.2rem
                          md: "1.4rem",
                          lg: "1.5rem",
                        },
                        fontWeight: 600,
                        color: "#2E7D32",
                        fontFamily: poppins.style.fontFamily,
                        textAlign: "center",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        hyphens: "auto",
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
                {/* Card 3 - Bottom Left - Growth Indicator (ORANGE) */}
                <Card
                  sx={{
                    flex: { md: "0 0 25%" },
                    width: { xs: "100%", md: "25%" },
                    minHeight: { xs: 120, sm: 140, md: 260, lg: 280 },
                    border: "1px solid black",
                    borderRadius: { xs: "16px", sm: "18px", md: "20px" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: { xs: "center", md: "flex-end" },
                    position: "relative",
                    overflow: "hidden",
                    backgroundImage: {
                      xs: "url('/assets/insights/bg-bottomleft-small.png')",
                      md: "url('/assets/insights/bg-bottomleft.png')",
                    },
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
                      height: { xs: "100%", md: "auto" },
                      display: { xs: "flex", md: "block" },
                      alignItems: { xs: "center", md: "normal" },
                      justifyContent: { xs: "center", md: "normal" },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          insights.header_insights.growth_indicator.split(" ")
                            .length > 1
                            ? {
                                xs: "1.3rem", // Increased from 1rem
                                sm: "1.4rem", // Increased from 1.1rem
                                md: "1.2rem",
                                lg: "1.3rem",
                              }
                            : {
                                xs: "1.4rem", // Increased from 1.1rem
                                sm: "1.5rem", // Increased from 1.2rem
                                md: "1.4rem",
                                lg: "1.5rem",
                              },
                        fontWeight: 600,
                        color: "#E65100",
                        fontFamily: poppins.style.fontFamily,
                        textAlign: "center",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        hyphens: "auto",
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
                    minHeight: { xs: 160, sm: 180, md: 260, lg: 280 },
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
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.9rem",
                          sm: "1rem",
                          md: "1.2rem",
                          lg: "1.3rem",
                        },
                        fontWeight: 400,
                        color: "#6A1B9A",
                        lineHeight: "1.4",
                        fontFamily: poppins.style.fontFamily,
                        maxWidth: "100%",
                        textAlign: { xs: "left", md: "right" },
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        hyphens: "auto",
                      }}
                    >
                      {insights.header_insights.emotional_tone}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Emotional Data Summary - Redesigned */}
            <Box sx={{ mt: 8, mb: 8 }}>
              {/* Section Title */}
              <Typography
                sx={{
                  fontSize: { xs: "1.4rem", sm: "1.6rem", md: "2rem" },
                  fontWeight: 500,
                  color: "#2D1B6B",
                  fontFamily: poppins.style.fontFamily,
                  mb: { xs: 0.5, sm: 0.8, md: 1 },
                  textAlign: "center",
                }}
              >
                Emotional Overview
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
                  fontWeight: 400,
                  color: "#2D1B6B",
                  fontFamily: poppins.style.fontFamily,
                  mb: { xs: 1.5, sm: 2, md: 2 },
                  textAlign: "center",
                }}
              >
                A comprehensive analysis of your emotional patterns and
                strengths.
              </Typography>

              {/* Dominant Emotions Section */}
              <Box
                sx={{
                  mt: { xs: 1.5, sm: 2, md: 2 },
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  border: "1px solid black",
                  borderRadius: { xs: "8px", sm: "10px" },
                  padding: { xs: "1rem", sm: "1.5rem", md: "2rem" },
                  backgroundColor: "rgba(213, 212, 244, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 1.5, sm: 2, md: 3 },
                  minHeight: { xs: "120px", sm: "160px", md: "180px" },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.4rem" },
                      fontWeight: 300,
                      color: "#2D1B6B",
                      fontFamily: poppins.style.fontFamily,
                      lineHeight: { xs: "1.4", sm: "1.5" },
                      mb: 2,
                    }}
                  >
                    Your emotional landscape reveals the core feelings that
                    shaped this journal entry, providing insight into your
                    current state of mind.
                  </Typography>

                  {/* Dominant Emotions Display */}
                  {insights.emotional_data.dominant_emotions &&
                  insights.emotional_data.dominant_emotions.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        justifyContent: "center",
                      }}
                    >
                      {insights.emotional_data.dominant_emotions.map(
                        (emotion, index) => (
                          <Chip
                            key={index}
                            label={
                              emotion.charAt(0).toUpperCase() + emotion.slice(1)
                            } // Capitalize first letter
                            sx={{
                              background:
                                "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                              color: "#1565c0",
                              fontFamily: poppins.style.fontFamily,
                              fontWeight: 500,
                              borderRadius: "12px",
                              px: 1.5,
                              py: 0.8,
                              border: "1px solid #90caf9",
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
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
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {getEmptyStateMessage("dominant_emotions")}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Personal Strengths */}
              <Box
                sx={{
                  mt: { xs: 2, sm: 2.5, md: 3 },
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "20px" },
                    fontWeight: 400,
                    color: "#2D1B6B",
                    mb: { xs: 0.5, sm: 0.8, md: 1 },
                    backgroundColor: "rgba(213, 212, 244, 0.3)",
                    fontFamily: poppins.style.fontFamily,
                    padding: { xs: "0.5rem", sm: "0.6rem", md: "0.8rem" },
                    borderRadius: { xs: "4px", sm: "6px" },
                  }}
                >
                  Personal Strengths
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.9rem", sm: "1rem", md: "20px" },
                    fontWeight: 300,
                    color: "#2D1B6B",
                    fontFamily: poppins.style.fontFamily,
                    lineHeight: { xs: "1.5", sm: "1.6" },
                    padding: { xs: "0.5rem 0", sm: "0.6rem 0" },
                  }}
                >
                  {insights.emotional_data.strengths &&
                  insights.emotional_data.strengths.length > 0 ? (
                    <>
                      You're showing the following strengths based on this
                      entry:&nbsp;
                      <strong>
                        {insights.emotional_data.strengths
                          .map(
                            (strength) =>
                              strength.charAt(0).toUpperCase() +
                              strength.slice(1)
                          )
                          .join(", ")}
                      </strong>
                      . These strengths reflect the qualities that are helping
                      you face what you're going through.
                    </>
                  ) : (
                    "Your personal strengths could not be determined clearly from this entry. You may try regenerating insights for a more tailored reflection."
                  )}
                </Typography>
              </Box>

              {/* Emotional Intensity */}
              <Box
                sx={{
                  mt: { xs: 2, sm: 2.5, md: 3 },
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "20px" },
                    fontWeight: 400,
                    color: "#2D1B6B",
                    mb: { xs: 0.5, sm: 0.8, md: 1 },
                    backgroundColor: "rgba(213, 212, 244, 0.3)",
                    fontFamily: poppins.style.fontFamily,
                    padding: { xs: "0.5rem", sm: "0.6rem", md: "0.8rem" },
                    borderRadius: { xs: "4px", sm: "6px" },
                  }}
                >
                  Emotional Intensity
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.9rem", sm: "1rem", md: "20px" },
                    fontWeight: 300,
                    color: "#2D1B6B",
                    fontFamily: poppins.style.fontFamily,
                    lineHeight: { xs: "1.5", sm: "1.6" },
                    padding: { xs: "0.5rem 0", sm: "0.6rem 0" },
                  }}
                >
                  {insights.emotional_data.emotional_intensity ? (
                    <>
                      Your emotional intensity for this entry is:&nbsp;
                      <strong>
                        {insights.emotional_data.emotional_intensity
                          .charAt(0)
                          .toUpperCase() +
                          insights.emotional_data.emotional_intensity.slice(1)}
                      </strong>
                      . This reflects how strongly you're experiencing your
                      emotions in this moment.
                    </>
                  ) : (
                    "Your emotional intensity level could not be determined for this entry. Please try regenerating the insights to receive a clearer reflection."
                  )}
                </Typography>
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
