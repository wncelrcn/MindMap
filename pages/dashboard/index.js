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
        <Box sx={{ flex: 1, mt: 5 }}>
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

            <Grid
              container
              spacing={2}
              sx={{
                alignItems: "stretch",
                justifyContent: "space-between",
                mb: 5,
              }}
            >
              {/* Create Entry Button */}
              <Grid item xs={12} sm={4} md={3}>
                <Box
                  sx={{
                    height: "225px",
                    bgcolor: "#f8f7fc",
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 2,
                    width: "250px",
                  }}
                >
                  <Link
                    href="/create-entry"
                    passHref
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      sx={{
                        borderRadius: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 3,
                        width: "100%",
                        bgcolor: "#f8f7fc",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src="/assets/folder-icon.png"
                        alt="Folder icon"
                        sx={{ width: "120px", height: "100px", mb: 2 }}
                      />
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color="#2D1B6B"
                        className={`${poppins.className}`}
                        sx={{ fontFamily: poppins.style.fontFamily }}
                      >
                        Create an Entry
                      </Typography>
                    </Button>
                  </Link>
                </Box>
              </Grid>

              {/* Hero Section Card */}
              <Grid item xs={12} sm={8} md={9}>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: "#f8f7fc",
                    borderRadius: 4,
                    height: "225px",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: "center",
                      p: { xs: 2, md: 4 },
                      width: "875px",
                    }}
                  >
                    {/* Person Image */}
                    <Box
                      sx={{
                        flex: "0 0 auto",
                        mr: { xs: 0, md: 4 },
                        mb: { xs: 2, md: 0 },
                        width: { xs: "70%", sm: "40%", md: "30%" },
                        maxWidth: "250px",
                      }}
                    >
                      <Box
                        component="img"
                        src="/assets/person-laptop.png"
                        alt="Person using laptop"
                        sx={{ width: "100%", height: "auto" }}
                      />
                    </Box>

                    {/* Text Content */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        color="#5A33B7"
                        fontWeight={300}
                        className={`${poppins.className}`}
                        gutterBottom
                        sx={{
                          fontStyle: "italic",
                          fontFamily: poppins.style.fontFamily,
                        }}
                      >
                        MindMap
                      </Typography>
                      <Typography
                        variant="h4"
                        component="h2"
                        fontWeight={300}
                        color="#2D1B6B"
                        className={`${poppins.className}`}
                        gutterBottom
                        sx={{
                          lineHeight: 1.2,
                          fontFamily: poppins.style.fontFamily,
                        }}
                      >
                        Your daily check-in,
                        <br />
                        reimagined.
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 2,
                          position: "absolute",
                          bottom: 24,
                          right: 22,
                        }}
                      >
                        <Button
                          variant="contained"
                          alignItems="right"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            mt: 2,
                            bgcolor: "#5A33B7",
                            borderRadius: "9999px",
                            fontWeight: 600,
                            px: 3,
                            "&:hover": {
                              bgcolor: "#4a2ba0",
                            },
                          }}
                        >
                          Take a Quiz
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Journals Section */}
            <Box mb={4}>
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
