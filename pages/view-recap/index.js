import { Box, Typography, Chip } from "@mui/material";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { createClient } from "@/utils/supabase/component";
import { Poppins } from "next/font/google";
import Head from "next/head";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function ViewRecap() {
  const router = useRouter();
  const { dateStart, dateEnd } = router.query;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [recapData, setRecapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const fetchRecapData = async () => {
      if (!dateStart || !dateEnd) return;

      const supabase = createClient();

      try {
        // Get current user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/");
          return;
        }

        setUsername(user.user_metadata?.name || "User");

        // Fetch recap data
        const { data, error } = await supabase
          .from("recap")
          .select(
            "weekly_summary, mood, feeling, contributing, moments, cope, remember"
          )
          .eq("user_UID", user.id)
          .eq("date_range_start", dateStart)
          .eq("date_range_end", dateEnd)
          .single();

        if (error) {
          console.error("Error fetching recap:", error);
        } else {
          setRecapData(data);
        }
      } catch (error) {
        console.error("Error fetching recap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecapData();
  }, [dateStart, dateEnd, router]);

  // Create card contents based on recap data
  const cardContents = recapData
    ? [
        {
          type: "intro",
          title: `Hello ${username}`,
          subtitle: "Ready to see your Recap?",
          mood: recapData.mood.split(",").map((mood) => {
            const cleanMood = mood.replace(/[\[\]"]/g, "").trim();
            return cleanMood
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ");
          }),
          buttonText: "View my Recap of the Week",
        },
        {
          type: "summary",
          title: "Weekly Summary",
          content: recapData.weekly_summary,
          icon: "📋",
        },
        {
          type: "content",
          title: "How You've Been Feeling",
          content: recapData.feeling,
          icon: "📝",
        },
        {
          type: "content",
          title: "What Might Be Contributing",
          content: recapData.contributing,
          icon: "🔍",
        },
        {
          type: "content",
          title: "Moments That Stood Out",
          content: recapData.moments,
          icon: "✨",
        },
        {
          type: "content",
          title: "What Helped You Cope",
          content: recapData.cope,
          icon: "💪",
        },
        {
          type: "content",
          title: "Remember This",
          content: recapData.remember,
          icon: "💙",
        },
      ]
    : [];

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      // Swiping left = going to next card (forward)
      if (index < cardContents.length - 1) {
        setDirection(1); // Moving forward
        setIndex((i) => i + 1);
      } else {
        // At the last card, navigate back to recaps page
        router.push("/recaps");
      }
    },
    onSwipedRight: () => {
      // Swiping right = going to previous card (backward)
      if (index > 0) {
        setDirection(-1); // Moving backward
        setIndex((i) => i - 1);
      }
    },
    trackMouse: true,
  });

  const handleIntroButtonClick = () => {
    // Going from intro (index 0) to next card (index 1)
    setDirection(1); // Moving forward, so next card comes from right
    setIndex(1);
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMonth = startDate.toLocaleDateString("en-US", {
      month: "short",
    });
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ fontFamily: poppins.style.fontFamily }}
      >
        <Typography variant="h5" color="#5A33B7">
          Loading your Recap...
        </Typography>
      </Box>
    );
  }

  if (!recapData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ fontFamily: poppins.style.fontFamily }}
      >
        <Typography variant="h6" color="#5A33B7">
          Recap not found
        </Typography>
      </Box>
    );
  }

  const currentCard = cardContents[index];

  return (
    <>
      <Head>
        <title>MindMap - Your Weekly Recap</title>
        <meta
          name="description"
          content="Your weekly journaling insights and emotional wellness summary."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

      <Box
        position="relative"
        minHeight="100vh"
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ overflow: "hidden" }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <Image
            src="/assets/recap/recap-bg.png"
            alt="Recap background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            {...swipeHandlers}
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={index}
                custom={direction}
                initial={{
                  x: direction > 0 ? 300 : direction < 0 ? -300 : 0,
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  x: direction > 0 ? -300 : direction < 0 ? 300 : 0,
                  opacity: 0,
                  scale: 0.9,
                }}
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { type: "spring", stiffness: 300, damping: 30 },
                }}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 16px 48px rgba(60,40,120,0.16)",
                  padding: 40,
                  width: 600,
                  height: 700,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  fontFamily: poppins.style.fontFamily,
                }}
              >
                {currentCard.type === "intro" ? (
                  <>
                    {/* Intro Card */}
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        color: "#5A33B7",
                        fontWeight: 500,
                        mb: 2,
                        fontFamily: poppins.style.fontFamily,
                      }}
                    >
                      Hello
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "3rem",
                        fontWeight: 600,
                        color: "#2D1B6B",
                        mb: 6,
                        textAlign: "center",
                        fontFamily: poppins.style.fontFamily,
                      }}
                    >
                      {username}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        color: "#333",
                        mb: 4,
                        textAlign: "center",
                        fontFamily: poppins.style.fontFamily,
                      }}
                    >
                      Ready to see your Recap?
                    </Typography>

                    {/* Mood Tags */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 6,
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {currentCard.mood.map((mood, i) => (
                        <Chip
                          key={i}
                          label={mood}
                          sx={{
                            backgroundColor: "#E8E0FF",
                            color: "#5A33B7",
                            fontFamily: poppins.style.fontFamily,
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>

                    {/* Button */}
                    <Box
                      onClick={handleIntroButtonClick}
                      sx={{
                        backgroundColor: "#5A33B7",
                        color: "white",
                        px: 4,
                        py: 2,
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontFamily: poppins.style.fontFamily,
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        "&:hover": {
                          backgroundColor: "#4A2A97",
                        },
                      }}
                    >
                      {currentCard.buttonText}
                    </Box>
                  </>
                ) : (
                  <>
                    {/* Content Cards */}
                    {/* Edit Icon (top right) */}
                    {currentCard.type === "content" &&
                      currentCard.title !== "Remember This" && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 24,
                            right: 24,
                            color: "#5A33B7",
                            fontSize: "1.5rem",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#4E2BBD"
                          >
                            <path d="M240-400h122l200-200q9-9 13.5-20.5T580-643q0-11-5-21.5T562-684l-36-38q-9-9-20-13.5t-23-4.5q-11 0-22.5 4.5T440-722L240-522v122Zm280-243-37-37 37 37ZM300-460v-38l101-101 20 18 18 20-101 101h-38Zm121-121 18 20-38-38 20 18Zm26 181h273v-80H527l-80 80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
                          </svg>
                        </Box>
                      )}

                    {/* Icon */}
                    <Typography sx={{ fontSize: "3rem", mb: 3 }}>
                      {currentCard.icon}
                    </Typography>

                    {/* Title */}
                    <Typography
                      sx={{
                        fontSize: "1.8rem",
                        fontWeight: 600,
                        color: "#5A33B7",
                        mb: 4,
                        textAlign: "center",
                        fontFamily: poppins.style.fontFamily,
                      }}
                    >
                      {currentCard.title}
                    </Typography>

                    {/* Content */}
                    <Typography
                      sx={{
                        fontSize: "1.1rem",
                        color: "#333",
                        lineHeight: 1.6,
                        textAlign: "center",
                        mb: 4,
                        maxWidth: "80%",
                        fontFamily: poppins.style.fontFamily,
                      }}
                    >
                      {currentCard.content}
                    </Typography>

                    {/* Navigation */}
                    {index < cardContents.length - 1 ? (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 24,
                          right: 24,
                          color: "#999",
                          fontStyle: "italic",
                          fontSize: "0.9rem",
                          fontFamily: poppins.style.fontFamily,
                        }}
                      >
                        Swipe to Continue →
                      </Box>
                    ) : (
                      <Box
                        onClick={() => router.push("/recaps")}
                        sx={{
                          position: "absolute",
                          bottom: 24,
                          right: 24,
                          backgroundColor: "#5A33B7",
                          color: "white",
                          px: 3,
                          py: 1.5,
                          borderRadius: "25px",
                          cursor: "pointer",
                          fontFamily: poppins.style.fontFamily,
                          fontWeight: 500,
                          fontSize: "0.9rem",
                          "&:hover": {
                            backgroundColor: "#4A2A97",
                          },
                        }}
                      >
                        Back to Recaps
                      </Box>
                    )}
                  </>
                )}

                {/* Progress indicator */}
                <Typography
                  sx={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    color: "#999",
                    fontSize: "0.9rem",
                    fontFamily: poppins.style.fontFamily,
                  }}
                >
                  {index + 1} / {cardContents.length}
                </Typography>
              </motion.div>
            </AnimatePresence>
          </div>
        </Box>
      </Box>
    </>
  );
}
