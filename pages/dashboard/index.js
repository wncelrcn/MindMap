import Head from "next/head";
import Footer from "@/components/footer";
import SupportFooter from "@/components/support_footer";
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { requireAuth } from "@/lib/requireAuth";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import RecentJournal from "@/components/recent_journal";

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
  return await requireAuth(context.req);
}

export default function DashboardPage({ user }) {
  const [username, setUsername] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchUsername = async () => {
      if (user && user.email) {
        try {
          const { data, error } = await supabase
            .from("user_table")
            .select("username")
            .eq("email", user.email)
            .single();

          if (error) {
            console.error("Error fetching username:", error);
          } else if (data) {
            setUsername(data.username);
            console.log("Fetched username:", data.username);
          }
        } catch (error) {
          console.error("Failed to fetch username:", error);
        }
      }
    };

    fetchUsername();
  }, [user]);

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
              justifyContent="space-between"
              alignItems="center"
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

              <Button
                variant="outlined"
                sx={{
                  borderRadius: "9999px",
                  borderColor: "#2D1B6B",
                  color: "#2D1B6B",
                  fontWeight: 400,
                  px: 3,
                  fontFamily: poppins.style.fontFamily,
                  "&:hover": {
                    borderColor: "#5A33B7",
                    backgroundColor: "rgba(90, 51, 183, 0.04)",
                  },
                }}
              >
                See your Weekly Recap
              </Button>
            </Box>

            {/* Header */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              alignItems="stretch"
              gap={2}
              sx={{ mt: 5 }}
            >
              {/* Create Entry Card */}
              <Box width={{ xs: "100%", md: "30%" }}>
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
                        className={`${poppins.className}`}
                        sx={{
                          color: "#5A33B7",
                          fontWeight: 300,
                          fontStyle: "italic",
                          fontFamily: poppins.style.fontFamily,
                        }}
                      >
                        MindMap
                      </Typography>
                      <Typography
                        fontWeight={500}
                        className={`${poppins.className}`}
                        sx={{
                          color: "#2D1B6B",
                          fontSize: { xs: "1.5rem", md: "1.6rem" },
                          fontFamily: poppins.style.fontFamily,
                          fontWeight: 400,
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
            <Box mb={4} mt={{ xs: 8, md: 4 }}>
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
              <Grid container spacing={3} sx={{ mb: 20 }}>
                <RecentJournal />
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
