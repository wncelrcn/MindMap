import Navbar from "@/components/navbar";
import { Box, TextField, Typography, Button, useTheme } from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Poppins, Raleway, Quicksand } from "next/font/google";

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

export default function Journal() {
  const [title, setTitle] = useState("Journal Title");
  const [editingTitle, setEditingTitle] = useState(false);
  const [content, setContent] = useState("");

  const handleTitleClick = () => setEditingTitle(true);
  const handleTitleBlur = () => {
    if (title.trim() === "") {
      setTitle("Journal Title");
    }
    setEditingTitle(false);
  };

  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
            <Link href="/dashboard" passHref legacyBehavior>
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

        {/* Journal content */}
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

          <TextField
            multiline
            fullWidth
            minRows={5}
            placeholder="Type your thoughts..."
            variant="standard"
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
            }}
          />
        </Box>

        {/* Suggestion Button (fixed at bottom of screen) */}
        {!content && (
          <Box
            position="fixed"
            bottom={0}
            left={0}
            width="100%"
            display="flex"
            justifyContent="center"
            bgcolor="#fff"
            py={3}
            zIndex={10}
            mb={2}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#E2DDF9",
                color: "#4E2BBD",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "12px",
                padding: "0.75rem 1.5rem",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#D4C7F3",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 500,
                }}
              >
                Having a hard time? Don’t worry, try our suggestions.
              </Typography>
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
