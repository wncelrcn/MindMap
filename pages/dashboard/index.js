import Head from "next/head";
import Footer from "@/components/layout/footer";
import SupportFooter from "@/components/layout/support_footer";
import { Box, Typography, Container, Grid, Button, Card } from "@mui/material";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import { useEffect, useState } from "react";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import RecentJournal from "@/components/cards/recent_journal";
import { createClient } from "@/utils/supabase/server-props";
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

  // Use recap context instead of local state
  const { recapData, recapLoading } = useRecap();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent journals
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
                    <Link href="/quiz" passHref>
                      <Button
                        variant="contained"
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
                    </Link>
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
            </Box>
          </Container>
        </Box>

        {/* Footer Section */}
        <Box component="footer">
          <SupportFooter />
          <Footer />
        </Box>
      </Box>
    </>
  );
}
