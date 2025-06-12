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
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/navbar";
import InsightSection from "@/components/InsightSection";
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

export default function ViewInsights({ user }) {
  const [username, setUsername] = useState(user.user_metadata.name);
  const [user_UID, setUser_UID] = useState(user.id);
  const [journalData, setJournalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

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
      <Box position="relative" width="100%" height={{ xs: "50px", md: "70px" }}>
        <Box
          position="absolute"
          top={16}
          zIndex={1}
          sx={{ padding: { xs: "1rem", sm: "1.5rem", md: "2rem 4rem", lg: "2rem 8rem" } }}
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
            lg: "3rem 8rem" 
          },
          paddingBottom: { xs: "4rem", sm: "6rem", md: "8rem" },
          marginBottom: { xs: "2rem", sm: "3rem", md: "4rem" },
        }}
      >
        {/* Page Title */}
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
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem", lg: "3.5rem" },
            fontWeight: 700,
            color: "#2D1B6B",
            lineHeight: "1.1",
            fontFamily: poppins.style.fontFamily,
            mb: { xs: 3, sm: 4, md: 4 },
          }}
        >
          Insights
        </Typography>

        {/* Insights Header */}
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
            {/* Card 1 - Top Left */}
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
                    fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.2rem", lg: "1.3rem" },
                    fontWeight: 400,
                    textAlign: "left",
                    color: "#1565C0",
                    lineHeight: "1.4",
                    fontFamily: poppins.style.fontFamily,
                    maxWidth: "100%",
                  }}
                >
                  Even on your most difficult days, you still find small moments
                  of gratitude—this shows your resilience and ability to find
                  light in dark times.
                </Typography>
              </CardContent>
            </Card>

            {/* Card 2 - Top Right */}
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
                  padding: { xs: "1rem 1.5rem", sm: "1rem 1.75rem", md: "1rem 2rem 2rem 2rem" }, 
                  zIndex: 1 
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.4rem", lg: "1.5rem" },
                    fontWeight: 600,
                    color: "#2E7D32",
                    fontFamily: poppins.style.fontFamily,
                  }}
                >
                  motivated
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
            {/* Card 3 - Bottom Left */}
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
                backgroundImage: "url('/assets/insights/bg-bottomleft.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                order: { xs: 3, md: 1 },
              }}
            >
              <CardContent
                sx={{ 
                  textAlign: "center", 
                  padding: { xs: "1rem 1.5rem", sm: "1rem 1.75rem", md: "1rem 2rem 2rem 2rem" }, 
                  zIndex: 1 
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.4rem", lg: "1.5rem" },
                    fontWeight: 600,
                    color: "#E65100",
                    fontFamily: poppins.style.fontFamily,
                  }}
                >
                  personal growth
                </Typography>
              </CardContent>
            </Card>

            {/* Card 4 - Bottom Right */}
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
                backgroundImage: "url('/assets/insights/bg-bottomright.png')",
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
                    fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.2rem", lg: "1.3rem" },
                    fontWeight: 400,
                    color: "#6A1B9A",
                    lineHeight: "1.4",
                    fontFamily: poppins.style.fontFamily,
                    maxWidth: "100%",
                    textAlign: { xs: "left", md: "right" },
                  }}
                >
                  Your journal entries suggest a generally positive emotional
                  tone, with some fluctuations based on daily experiences.
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
          mainText="Today, you faced challenges but chose to process your emotions, shifting your mindset to transform obstacles into opportunities for growth and self-improvement."
          imagePosition="left"
          additionalContent={[
            {
              title: "Embrace Balance",
              description:
                "Lately, you've been struggling to balance productivity with rest. You tend to push yourself to keep going, even when your body and mind need a break. However, true progress comes from sustainable habits—allowing yourself to rest will ultimately make you more effective and creative.",
            },
            {
              title: "Practice Self-Compassion",
              description:
                "It's easy to be hard on yourself when things don't go as planned. Today, you learned that patience and self-kindness are just as important as determination. Give yourself the same understanding that you would offer to a friend.",
            },
          ]}
        />

        <InsightSection
          title="Coping Strategies"
          subtitle="Tailored strategies to manage specific emotions."
          imageSrc="/assets/people/person-9.png"
          mainText="Today, you faced challenges but chose to process your emotions, shifting your mindset to transform obstacles into opportunities for growth and self-improvement."
          imagePosition="right"
          additionalContent={[
            {
              title: "Embrace Balance",
              description:
                "Lately, you've been struggling to balance productivity with rest. You tend to push yourself to keep going, even when your body and mind need a break. However, true progress comes from sustainable habits—allowing yourself to rest will ultimately make you more effective and creative.",
            },
            {
              title: "Practice Self-Compassion",
              description:
                "It's easy to be hard on yourself when things don't go as planned. Today, you learned that patience and self-kindness are just as important as determination. Give yourself the same understanding that you would offer to a friend.",
            },
          ]}
        />

        <InsightSection
          title="Goal Setting"
          subtitle="Personalized goals to improve emotional well-being."
          imageSrc="/assets/people/person-8.png"
          mainText="Today, you faced challenges but chose to process your emotions, shifting your mindset to transform obstacles into opportunities for growth and self-improvement."
          imagePosition="left"
          additionalContent={[
            {
              title: "Embrace Balance",
              description:
                "Lately, you've been struggling to balance productivity with rest. You tend to push yourself to keep going, even when your body and mind need a break. However, true progress comes from sustainable habits—allowing yourself to rest will ultimately make you more effective and creative.",
            },
            {
              title: "Practice Self-Compassion",
              description:
                "It's easy to be hard on yourself when things don't go as planned. Today, you learned that patience and self-kindness are just as important as determination. Give yourself the same understanding that you would offer to a friend.",
            },
          ]}
        />
      </Box>
    </>
  );
}