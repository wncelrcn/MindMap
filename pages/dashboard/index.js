import Head from "next/head";
import Footer from "@/components/layout/footer";
import SupportFooter from "@/components/layout/support_footer";
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import { useEffect, useState, useCallback } from "react";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import RecentJournal from "@/components/cards/recent_journal";
import { createClient } from "@/utils/supabase/server-props";
import { useRouter } from "next/router";
import InfoIcon from "@mui/icons-material/Info";
import axios from "axios";
import BadgeUnlockModal from "@/components/BadgeUnlockModal";

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
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

import { useRecap } from "@/contexts/RecapContext";

export default function DashboardPage({ user }) {
  const router = useRouter();
  const [username, setUsername] = useState(user.user_metadata.name);
  const [user_UID, setUser_UID] = useState(user.id);
  const [recentJournals, setRecentJournals] = useState([]);
  const [permaModalOpen, setPermaModalOpen] = useState(false);

  // Badge modal state
  const [badgeQueue, setBadgeQueue] = useState([]);
  const [currentBadge, setCurrentBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [isCheckingBadges, setIsCheckingBadges] = useState(false);

  // Use recap context instead of local state
  const { recapData, recapLoading } = useRecap();

  // Session storage helpers with error handling
  const getShownBadges = useCallback(() => {
    try {
      const stored = sessionStorage.getItem("shownBadges");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Error reading shown badges from session storage:", error);
      return [];
    }
  }, []);

  const setShownBadges = useCallback((badges) => {
    try {
      sessionStorage.setItem("shownBadges", JSON.stringify(badges));
    } catch (error) {
      console.warn("Error saving shown badges to session storage:", error);
    }
  }, []);

  // Badge checking function with improved error handling
  const checkNewBadges = useCallback(
    async (retryCount = 0) => {
      if (isCheckingBadges) return; // Prevent concurrent badge checks

      setIsCheckingBadges(true);

      try {
        console.log("Checking for new badges...");
        const response = await axios.post(
          "/api/badges/check-unlock",
          {},
          {
            timeout: 10000, // 10 second timeout
            withCredentials: true, // Include cookies for authentication
          }
        );

        if (response.data.success) {
          // Fix: Use 'newlyUnlocked' instead of 'newBadges'
          const newBadges = response.data.newlyUnlocked || [];
          console.log("New badges found:", newBadges);

          if (newBadges.length > 0) {
            const shownBadges = getShownBadges();

            // Fix: Use 'badge_id' instead of 'id'
            const unseenBadges = newBadges.filter(
              (badge) => !shownBadges.includes(badge.badge_id)
            );

            if (unseenBadges.length > 0) {
              console.log("Unseen badges:", unseenBadges);

              // Add all unseen badges to queue
              setBadgeQueue((prev) => [...prev, ...unseenBadges]);

              // Mark all badges as shown to prevent duplicates
              const newShownBadges = [
                ...shownBadges,
                ...unseenBadges.map((b) => b.badge_id),
              ];
              setShownBadges(newShownBadges);
            }
          }
        }
      } catch (error) {
        console.error("Error checking badges:", error);

        // Retry logic for network failures
        if (
          retryCount < 2 &&
          (error.code === "ECONNABORTED" || error.response?.status >= 500)
        ) {
          console.log(`Retrying badge check (attempt ${retryCount + 1})...`);
          setTimeout(() => checkNewBadges(retryCount + 1), 2000);
        }
      } finally {
        setIsCheckingBadges(false);
      }
    },
    [isCheckingBadges, getShownBadges, setShownBadges]
  );

  // Process badge queue - show one badge at a time
  useEffect(() => {
    if (badgeQueue.length > 0 && !showBadgeModal) {
      const nextBadge = badgeQueue[0];
      setBadgeQueue((prev) => prev.slice(1));
      setCurrentBadge(nextBadge);
      setShowBadgeModal(true);
    }
  }, [badgeQueue, showBadgeModal]);

  // Check for badges on page load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkNewBadges();
    }, 1000); // Small delay to ensure page is loaded

    return () => clearTimeout(timeoutId);
  }, [checkNewBadges]);

  // Listen for badge unlock events from other parts of the app
  useEffect(() => {
    const handleBadgeUnlock = (event) => {
      console.log("Badge unlock event received:", event.detail);
      checkNewBadges();
    };

    window.addEventListener("badgeUnlocked", handleBadgeUnlock);

    return () => {
      window.removeEventListener("badgeUnlocked", handleBadgeUnlock);
    };
  }, [checkNewBadges]);

  // PERMA Modal handlers
  const handleOpenPermaModal = () => {
    setPermaModalOpen(true);
  };

  const handleClosePermaModal = () => {
    setPermaModalOpen(false);
  };

  const handleGoToQuiz = () => {
    setPermaModalOpen(false);
    window.open(
      "https://www.purposeplus.com/survey/perma-profiler/",
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Badge modal handlers
  const handleCloseBadgeModal = () => {
    setShowBadgeModal(false);
    setCurrentBadge(null);
  };

  const handleViewBadges = () => {
    setShowBadgeModal(false);
    setCurrentBadge(null);
    router.push("/profile#badges");
  };

  // Fetch recent journals
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/fetch-journal/recent_journal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({ user_UID: user_UID }),
        });

        const data = await res.json();
        if (res.ok) {
          setRecentJournals(data.entries);
        } else {
          console.error("Failed to fetch recent journals:", data.error);
        }
      } catch (error) {
        console.error("Error fetching recent journals:", error);
      }
    };

    fetchData();
  }, [user_UID]);

  return (
    <>
      <Head>
        <title>MindMap - Dashboard</title>
        <meta
          name="description"
          content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Navbar />
        {/* Main Content */}
        <Box sx={{ flex: 1, mt: 4 }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header with Gradient Text */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={2}
              mb={4}
            >
              <Typography
                variant="h3"
                component="h1"
                fontWeight="700"
                className={`${poppins.className}`}
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  color: "#2D1B6B",
                  fontSize: { xs: "2.8rem", sm: "3.5rem" },
                  "& span": {
                    background:
                      "linear-gradient(90deg, #2D1B6B 0%, #ED6D6C 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  },
                }}
              >
                <span>Hello, {username}!</span>
              </Typography>

              <Link href="/recaps" passHref legacyBehavior>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: "9999px",
                    borderColor: "#2D1B6B",
                    color: "#2D1B6B",
                    fontWeight: 400,
                    px: 3,
                    width: { xs: "100%", sm: "auto" },
                    fontFamily: poppins.style.fontFamily,
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "#5A33B7",
                      backgroundColor: "rgba(90, 51, 183, 0.04)",
                    },
                  }}
                >
                  See your Weekly Recap
                </Button>
              </Link>
            </Box>

            {/* Header */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              alignItems="stretch"
              gap={2}
            >
              {/* Create Entry Card */}
              <Box width={{ xs: "100%", md: "30%" }}>
                <Link href="/create-entry" passHref legacyBehavior>
                  <a
                    style={{
                      textDecoration: "none",
                      width: "100%",
                      maxWidth: "30%",
                    }}
                  >
                    <Card
                      sx={{
                        backgroundColor: "#f6f3ff",
                        borderRadius: 4,
                        textAlign: "center",
                        minHeight: 220,
                        height: "80%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Box>
                        <img
                          src="/assets/folder-icon.png"
                          alt="Create Entry Icon"
                          style={{ width: "100%", maxWidth: "100%" }}
                        />
                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        className={`${poppins.className}`}
                        sx={{
                          color: "#2D1B6B",
                          fontFamily: poppins.style.fontFamily,
                          mt: 1,
                        }}
                      >
                        Create an Entry
                      </Typography>
                    </Card>
                  </a>
                </Link>
              </Box>

              {/* MindMap Quiz Card */}
              <Box width={{ xs: "100%", md: "70%" }}>
                <Card
                  sx={{
                    backgroundColor: "#f9f7ff",
                    borderRadius: 4,
                    minHeight: 220,
                    height: "80%",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: { xs: 2, md: 3 },
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    flexDirection={{ xs: "column", md: "row" }}
                  >
                    <Box mr={{ md: 3 }} mb={{ xs: 1, md: 0 }}>
                      <img
                        src="/assets/person-laptop.png"
                        alt="Illustration"
                        style={{ width: "100%", maxWidth: "100%" }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        className={`${quicksand.className}`}
                        sx={{
                          color: "#5A33B7",
                          fontFamily: quicksand.style.fontFamily,
                        }}
                      >
                        MindMap
                      </Typography>
                      <Typography
                        fontWeight={500}
                        className={`${raleway.className}`}
                        sx={{
                          color: "#2D1B6B",
                          fontSize: { xs: "1.5rem", md: "1.7rem" },
                          fontFamily: raleway.style.fontFamily,
                        }}
                      >
                        Your daily check-in, <br /> reimagined.
                      </Typography>
                    </Box>
                  </Box>
                  <Box mt={{ xs: 2, md: 18 }}>
                    <Button
                      variant="contained"
                      onClick={handleOpenPermaModal}
                      sx={{
                        backgroundColor: "#5A33B7",
                        borderRadius: "9999px",
                        textTransform: "none",
                        fontFamily: poppins.style.fontFamily,
                        width: "200px",
                        px: 3,
                        py: 1,
                        fontSize: "0.875rem",
                        "&:hover": {
                          backgroundColor: "#45249C",
                        },
                      }}
                    >
                      Take a Quiz
                    </Button>
                  </Box>
                </Card>
              </Box>
            </Box>

            {/* Recent Journals Section */}
            <Box mb={4} mt={{ xs: 8, md: 6 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography
                  variant="h4"
                  component="h2"
                  fontWeight={500}
                  color="#2D1B6B"
                  className={`${poppins.className}`}
                  sx={{ fontFamily: poppins.style.fontFamily }}
                >
                  Recent Journals
                </Typography>
                <Typography
                  component="a"
                  href="/journals"
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    color: "#5A33B7",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  className={`${poppins.className}`}
                >
                  See All
                </Typography>
              </Box>

              {/* Journal Cards */}
              {recentJournals.length > 0 ? (
                <Grid
                  container
                  spacing={3}
                  sx={{
                    mb: 20,
                    display: "flex",
                    justifyContent: {
                      xs: "center",
                      sm: "center",
                      md: "flex-start",
                    },
                    alignItems: "center",
                    maxWidth: "100%",
                    mx: "auto",
                    px: { xs: 2, sm: 3, md: 1 },
                  }}
                >
                  {recentJournals.map((entry) => {
                    let contentPreview = "";
                    if (Array.isArray(entry.journal_entry)) {
                      contentPreview = entry.journal_entry[0]?.answer || "";
                    } else if (
                      entry.journal_entry &&
                      typeof entry.journal_entry === "object"
                    ) {
                      contentPreview =
                        entry.journal_entry.default ||
                        Object.values(entry.journal_entry)[0] ||
                        "";
                    } else if (typeof entry.journal_entry === "string") {
                      contentPreview = entry.journal_entry;
                    }

                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        lg={3}
                        key={entry.journal_id || entry.id}
                      >
                        <RecentJournal
                          journalID={entry.journal_id}
                          title={entry.title}
                          content={contentPreview}
                          date={entry.date_created}
                          time={entry.time_created}
                          journalType={entry.journal_type}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    mb: 20,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#2D1B6B",
                      fontFamily: poppins.style.fontFamily,
                      fontWeight: 400,
                      fontSize: "18px",
                    }}
                    className={`${poppins.className}`}
                  >
                    No journals found. Start writing your first entry!
                  </Typography>
                </Box>
              )}
            </Box>
          </Container>
        </Box>

        {/* Footer Section */}
        <Box component="footer">
          <SupportFooter />
          <Footer />
        </Box>
      </Box>

      {/* PERMA Profiler Modal */}
      <Dialog
        open={permaModalOpen}
        onClose={handleClosePermaModal}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={false}
        keepMounted={false}
        disableScrollLock={true}
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
          Take the PERMA Profiler Quiz
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
            This quiz will help you assess your overall well-being across five
            core pillars: <strong>Positive Emotion</strong>,{" "}
            <strong>Engagement</strong>, <strong>Relationships</strong>,{" "}
            <strong>Meaning</strong>, and <strong>Accomplishment</strong>.
          </Typography>
          <Typography
            sx={{
              mb: 2,
              lineHeight: 1.6,
              color: "#333",
              fontFamily: poppins.style.fontFamily,
            }}
          >
            You'll be redirected to an external site to complete the quiz.
          </Typography>
          <Typography
            sx={{
              mb: 3,
              lineHeight: 1.6,
              color: "#333",
              fontFamily: poppins.style.fontFamily,
            }}
          >
            Your results can be used to personalize your wellness journey.
          </Typography>
          <Typography
            sx={{
              lineHeight: 1.6,
              color: "#2D1B6B",
              fontFamily: poppins.style.fontFamily,
              fontWeight: 600,
            }}
          >
            Ready to begin?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClosePermaModal}
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "#888",
              fontWeight: 500,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGoToQuiz}
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
            Go to Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Badge Unlock Modal */}
      <BadgeUnlockModal
        open={showBadgeModal}
        badge={currentBadge}
        onClose={handleCloseBadgeModal}
        onViewBadges={handleViewBadges}
      />
    </>
  );
}
