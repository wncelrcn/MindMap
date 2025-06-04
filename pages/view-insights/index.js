// Objective: This page will display the insights of the journal entry.
// Goal: Finish UI

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
          alt="Journal Insights"
          layout="fill"
          objectFit="cover"
          priority
        />
      </Box>

      {/* Insights Content */}
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
          Journal Insights
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
          Sample Title
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
          Sample Date
        </Typography>
      </Box>
    </>
  );
}
