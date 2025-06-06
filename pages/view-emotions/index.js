import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Paper,
  Avatar,
} from "@mui/material";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import MoodDistributionChart from "@/components/MoodDistributionChart";
import { processEmotionData } from "@/utils/helper/emotion/emotionConfig";
import { useState, useEffect } from "react";
import { Poppins, Raleway, Quicksand } from "next/font/google";
import { createClient } from "@/utils/supabase/server-props";
import Head from "next/head";

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

export default function ViewEmotions({ user }) {
  const [user_UID, setUser_UID] = useState(user.id);
  const [loading, setLoading] = useState(true);
  const [journalData, setJournalData] = useState(null);
  const [emotionsData, setEmotionsData] = useState(null);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  useEffect(() => {
    const fetchJournalAndEmotions = async () => {
      try {
        const currentJournalID = sessionStorage.getItem("currentJournalId");
        const currentJournalType = sessionStorage.getItem("currentJournalType");
        if (!currentJournalID) {
          setError("No journal ID found");
          setLoading(false);
          return;
        }

        // Fetch journal data and emotions data in parallel
        const [journalResponse, emotionsResponse] = await Promise.all([
          fetch(`/api/fetch-journal/id_journal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: currentJournalID,
              type: currentJournalType,
            }),
          }),
          fetch(`/api/fetch-journal/emotions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              journal_id: currentJournalID,
              journal_type: currentJournalType,
            }),
          }),
        ]);

        const journalData = await journalResponse.json();
        const emotionsData = await emotionsResponse.json();

        if (!journalResponse.ok) {
          throw new Error(journalData.message || "Failed to fetch journal");
        }

        setJournalData(journalData.entry);

        // Set emotions data if available
        if (emotionsResponse.ok && emotionsData.emotions) {
          setEmotionsData(emotionsData.emotions);
        } else {
          console.warn("No emotions data available:", emotionsData.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJournalAndEmotions();
  }, [user_UID]);

  const getEmotions = () => {
    // Use shared utility function for processing emotions
    return processEmotionData(emotionsData);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography
            sx={{
              fontFamily: poppins.style.fontFamily,
              fontSize: "1.2rem",
              color: "#2D1B6B",
            }}
          >
            Loading emotions...
          </Typography>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography
            color="error"
            sx={{
              fontFamily: poppins.style.fontFamily,
              fontSize: "1.2rem",
            }}
          >
            {error}
          </Typography>
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

      {/* Header with image */}
      <Box position="relative" width="100%" height={{ xs: "50px", md: "70px" }}>
        <Box
          position="absolute"
          top={16}
          zIndex={1}
          sx={{ padding: { xs: "1.5rem", md: "2rem 8rem" } }}
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
          padding: { xs: "2rem 1.5rem", md: "3rem 8rem" },
          paddingBottom: "8rem",
          marginBottom: "4rem",
        }}
      >
        {/* Page Title */}
        <Typography
          sx={{
            fontSize: { xs: "0.9rem", md: "1rem" },
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
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            fontWeight: 700,
            color: "#2D1B6B",
            lineHeight: "1.1",
            fontFamily: poppins.style.fontFamily,
            mb: 4,
          }}
        >
          Emotions
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "1.1rem", md: "1.3rem" },
            fontWeight: 400,
            color: "#2D1B6B",
            opacity: 1,
            fontFamily: poppins.style.fontFamily,
          }}
        >
          Mood Distribution Insights
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.9rem", md: "1rem" },
            fontWeight: 300,
            color: "#2D1B6B",
            opacity: 1,
            fontFamily: poppins.style.fontFamily,
            mb: 3,
          }}
        >
          How you felt
        </Typography>

        {/* Mood Distribution Chart */}
        <MoodDistributionChart emotions={emotionsData} />

        {/* Emotion Cards Grid */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, md: 3 },
          }}
        >
          {getEmotions().map((emotion, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                height: { xs: "160px", md: "180px" },
                width: "100%",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  height: "100%",
                }}
              >
                {/* Emotion Icon and Info */}
                <Avatar
                  sx={{
                    background: emotion.gradientColor,
                    width: { xs: 56, md: 64 },
                    height: { xs: 56, md: 64 },
                    boxShadow: `0 4px 20px ${emotion.color}40`,
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.8rem" } }}>
                    {emotion.icon}
                  </Typography>
                </Avatar>

                {/* Emotion Details */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: "1.3rem", md: "1.5rem" },
                        fontWeight: 600,
                        color: "#2D1B6B",
                        fontFamily: poppins.style.fontFamily,
                        mr: "auto",
                      }}
                    >
                      {emotion.emotion}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "1.2rem", md: "1.4rem" },
                        fontWeight: 700,
                        color: emotion.color,
                        fontFamily: poppins.style.fontFamily,
                      }}
                    >
                      {emotion.intensity}%
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={emotion.intensity}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${emotion.color}15`,
                        "& .MuiLinearProgress-bar": {
                          background: emotion.gradientColor,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography
                    sx={{
                      fontSize: { xs: "0.95rem", md: "1rem" },
                      color: "#666",
                      lineHeight: 1.5,
                      fontFamily: poppins.style.fontFamily,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {emotion.description}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </>
  );
}
