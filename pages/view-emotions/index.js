// Goal: This page will display the emotions of the journal entry.
// Goal: Finish UI

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar";
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
    const fetchJournal = async () => {
      try {
        const currentJournalID = sessionStorage.getItem("currentJournalId");
        const currentJournalType = sessionStorage.getItem("currentJournalType");
        if (!currentJournalID) {
          setError("No journal ID found");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/fetch-journal/id_journal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentJournalID,
            type: currentJournalType,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch journal");
        }

        setJournalData(data.entry);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [user_UID]);

  // TODO: Replace this with actual AI-generated emotion analysis
  const getEmotions = () => {
    if (!journalData) return [];

    return [
      {
        emotion: "Joy",
        intensity: 75,
        description:
          "Strong positive emotions detected throughout the journal entry, particularly when discussing achievements and relationships.",
        color: "#FFD700",
        icon: "😊",
      },
      {
        emotion: "Gratitude",
        intensity: 85,
        description:
          "High levels of appreciation and thankfulness expressed towards various aspects of life.",
        color: "#32CD32",
        icon: "🙏",
      },
      {
        emotion: "Anxiety",
        intensity: 35,
        description:
          "Mild concerns about future uncertainties, but well-managed and acknowledged.",
        color: "#FF6B6B",
        icon: "😰",
      },
      {
        emotion: "Hope",
        intensity: 90,
        description:
          "Overwhelming sense of optimism and positive expectations for the future.",
        color: "#87CEEB",
        icon: "🌟",
      },
      {
        emotion: "Reflection",
        intensity: 70,
        description:
          "Deep contemplative thoughts about personal growth and life experiences.",
        color: "#DDA0DD",
        icon: "🤔",
      },
    ];
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography>Loading emotions...</Typography>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
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
      <Box position="relative" width="100%" height="234px">
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
        <Image
          src="/assets/header.png"
          alt="Journal Emotions"
          layout="fill"
          objectFit="cover"
          priority
        />
      </Box>

      {/* Emotions Content */}
      <Box
        sx={{
          padding: { xs: "2rem 1.5rem", md: "3rem 8rem" },
          paddingBottom: "10rem",
          marginBottom: "8rem",
        }}
      >
        <Typography
          sx={{
            fontSize: "2rem",
            fontWeight: 600,
            color: "#2D1B6B",
            lineHeight: "normal",
            fontFamily: poppins.style.fontFamily,
            mb: 2,
          }}
        >
          Emotional Analysis
        </Typography>

        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "#2D1B6B",
            lineHeight: "normal",
            fontFamily: poppins.style.fontFamily,
            mb: 1,
          }}
        >
          {journalData?.title || "Untitled Journal"}
        </Typography>

        <Typography
          mt={1}
          mb={3}
          fontWeight={500}
          fontSize="1.2rem"
          color="#2D1B6B"
          sx={{
            fontFamily: poppins.style.fontFamily,
            fontWeight: 300,
          }}
        >
          {formatDate(journalData?.date_created)}
        </Typography>

        {/* Emotions List */}
        <Typography
          sx={{
            fontSize: "1.8rem",
            fontWeight: 600,
            color: "#2D1B6B",
            lineHeight: "normal",
            fontFamily: poppins.style.fontFamily,
            mb: 4,
          }}
        >
          Detected Emotions
        </Typography>

        <Grid container spacing={3}>
          {getEmotions().map((emotion, index) => (
            <Grid item xs={12} key={index}>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  border: `2px solid ${emotion.color}20`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: emotion.color,
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <Typography sx={{ fontSize: "1.5rem" }}>
                        {emotion.icon}
                      </Typography>
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "1.3rem",
                          fontWeight: 600,
                          color: "#2D1B6B",
                          fontFamily: poppins.style.fontFamily,
                        }}
                      >
                        {emotion.emotion}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={emotion.intensity}
                          sx={{
                            flex: 1,
                            mr: 2,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: `${emotion.color}20`,
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: emotion.color,
                              borderRadius: 4,
                            },
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 500,
                            color: emotion.color,
                            fontFamily: poppins.style.fontFamily,
                          }}
                        >
                          {emotion.intensity}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      color: "#4A3E8E",
                      lineHeight: 1.6,
                      fontFamily: poppins.style.fontFamily,
                    }}
                  >
                    {emotion.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
