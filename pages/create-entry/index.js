import Navbar from "@/components/navbar";
import { Box, TextField, Typography, Button, useTheme } from "@mui/material";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Poppins, Raleway, Quicksand } from "next/font/google";
import { createClient } from "@/utils/supabase/server-props";

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

export default function Journal({ user }) {
  const [user_UID, setUser_UID] = useState(user.id);
  const [title, setTitle] = useState("Journal Title");
  const [editingTitle, setEditingTitle] = useState(false);
  const [content, setContent] = useState("");
  const [sections, setSections] = useState([]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showButton, setShowButton] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastActivity >= 2000 && content) {
        setShowButton(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [lastActivity, content]);

  const handleTitleClick = () => setEditingTitle(true);
  const handleTitleBlur = () => {
    if (title.trim() === "") {
      setTitle("Journal Title");
    }
    setEditingTitle(false);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setLastActivity(Date.now());
  };

  const handleGoDeeper = async () => {
    setShowButton(false);

    // Build the conversation history as a string
    let history = "";
    if (content.trim()) {
      history += `Q: Journal Entry\nA: ${content.trim()}\n`;
    }
    sections.forEach((section) => {
      if (section.subtitle && section.content.trim()) {
        history += `Q: ${section.subtitle}\nA: ${section.content.trim()}\n`;
      }
    });

    // The last answer is either the main content (if no sections) or the last section's content
    let lastText = "";
    if (sections.length === 0) {
      lastText = content;
    } else {
      lastText = sections[sections.length - 1].content;
    }

    // Send the full history and the last answer (for clarity)
    const res = await fetch("/api/create-journal/freeform-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, lastText }),
    });

    const data = await res.json();

    setSections([...sections, { subtitle: data.question, content: "" }]);
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
    setLastActivity(Date.now());
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
      if (
        !content.trim() &&
        !sections.some((section) => section.content.trim())
      ) {
        setError("Please enter some content before saving");
        return;
      }

      // Build journalData as an array of {question, answer} objects
      const journalData = [];
      if (content.trim()) {
        journalData.push({
          question: "Journal Entry",
          answer: content.trim(),
        });
      }
      sections.forEach((section, index) => {
        if (section.content.trim()) {
          journalData.push({
            question: section.subtitle?.trim() || `Section ${index + 1}`,
            answer: section.content.trim(),
          });
        }
      });

      const summaryRes = await fetch("/api/analyze-journal/journal_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journal_text: journalData }),
      });

      const summaryData = await summaryRes.json();

      const res = await fetch("/api/create-journal/freeform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journal_summary: summaryData["summary"],
          user_UID: user_UID,
          journal_entry: journalData,
          title: title.trim() || "Untitled Entry",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create entry");
      }

      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
      console.error("Error creating journal entry:", error);
    }
  };

  const handleSuggestionsClick = () => {
    router.push("/guided-journaling");
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
            <>
              {/* Title */}
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
            </>
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

          {/* Journal Entry */}
          <TextField
            multiline
            fullWidth
            minRows={5}
            placeholder="Type your thoughts..."
            variant="standard"
            value={content}
            onChange={handleContentChange}
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
              marginBottom: "1.5rem",
            }}
          />

          {sections.map((section, index) => (
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
                {section.subtitle || "Question"}
              </Typography>

              <TextField
                multiline
                fullWidth
                minRows={5}
                placeholder="Type your thoughts..."
                variant="standard"
                value={section.content}
                onChange={(e) =>
                  handleSectionChange(index, "content", e.target.value)
                }
                InputProps={{
                  disableUnderline: true,
                  style: {
                    fontStyle: section.content ? "normal" : "italic",
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

          {showButton && (
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
                onClick={handleGoDeeper}
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
                  Go Deeper
                </Typography>
              </Button>

              <Button
                variant="contained"
                onClick={handleFinishEntry}
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
                  Finish Entry
                </Typography>
              </Button>
            </Box>
          )}
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
              onClick={handleSuggestionsClick}
              sx={{
                backgroundColor: "#E2DDF9",
                color: "#4E2BBD",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "12px",
                padding: "0.95rem 2rem",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#D4C7F3",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 400,
                  fontSize: "1.1rem",
                }}
              >
                Having a hard time? Don't worry, try our suggestions.
              </Typography>
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
