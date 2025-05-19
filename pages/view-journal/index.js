import {
  Box,
  Container,
  Typography,
  useTheme,
  Grid,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import { Poppins, Raleway, Quicksand } from "next/font/google";
import { requireAuth } from "@/lib/requireAuth";

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
  return await requireAuth(context.req);
}

export default function ViewJournal({ user }) {
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

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const currentJournalID = sessionStorage.getItem("currentJournalId");
        if (!currentJournalID) {
          setError("No journal ID found");
          setLoading(false);
          return;
        }

        console.log("Sending ID:", currentJournalID);

        const response = await fetch(`/api/fetch-journal/id_journal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentJournalID,
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
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography>Loading journal...</Typography>
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
      <Navbar />

      {/* Header with image */}
      <Box position="relative" width="100%" height="234px">
        <Box
          position="absolute"
          top={16}
          zIndex={1}
          sx={{ padding: { xs: "1.5rem", md: "2rem 8rem" } }}
        >
          <Link href="/journals" passHref legacyBehavior>
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
          {journalData?.title || "Untitled Journal"}
        </Typography>

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
          {formatDate(journalData?.date_created)}
        </Typography>

        <Typography
          sx={{
            fontSize: "1.8rem",
            fontWeight: 600,
            color: "#2D1B6B",
            lineHeight: "normal",
            fontFamily: poppins.style.fontFamily,
            mb: 4,
            mt: 8,
          }}
        >
          Summary
        </Typography>

        <Typography
          sx={{
            fontSize: "1rem",
            color: "#4A3E8E",
            lineHeight: 1.6,
            fontFamily: poppins.style.fontFamily,
            whiteSpace: "pre-wrap",
            mb: 4,
          }}
        >
          "SUMMARY"
        </Typography>

        {/* Buttons */}
        <Box
          width="100%"
          display="flex"
          bgcolor="#fff"
          py={3}
          zIndex={10}
          mb={10}
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#4E2BBD",
              color: "#fff",
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
              View Insights
            </Typography>
          </Button>

          <Button
            variant="contained"
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
              View Emotions
            </Typography>
          </Button>
        </Box>

        <Typography
          sx={{
            fontSize: "1.8rem",
            fontWeight: 600,
            color: "#2D1B6B",
            lineHeight: "normal",
            fontFamily: poppins.style.fontFamily,
            mb: 4,
            mt: 8,
          }}
        >
          Full Journal Entry
        </Typography>

        {(Array.isArray(journalData?.journal_entry)
          ? journalData.journal_entry
          : []
        ).map((item, idx) => (
          <Box key={idx} sx={{ marginBottom: "2rem" }}>
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
              {item.question}
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "#4A3E8E",
                lineHeight: 1.6,
                fontFamily: poppins.style.fontFamily,
                whiteSpace: "pre-wrap",
                fontStyle: item.answer ? "normal" : "italic",
                marginBottom: "1.5rem",
              }}
            >
              {item.answer || "No answer provided"}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}
