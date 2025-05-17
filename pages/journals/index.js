import Head from "next/head";
import Footer from "@/components/footer";
import SupportFooter from "@/components/support_footer";
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
import Navbar from "@/components/navbar";
import { requireAuth } from "@/lib/requireAuth";
import { supabase } from "@/lib/supabase";
import RecentJournal from "@/components/recent_journal";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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

export default function Journals({ user }) {
  const [username, setUsername] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user && user.email) {
        try {
          const { data, error } = await supabase
            .from("user_table")
            .select("username, user_id")
            .eq("email", user.email)
            .single();

          if (error) {
            console.error("Error fetching username:", error);
          } else if (data) {
            setUsername(data.username);
            // Fetch journal entries after getting user_id
            fetchJournalEntries(data.user_id);
          }
        } catch (error) {
          console.error("Failed to fetch username:", error);
        }
      }
    };

    fetchUsername();
  }, [user]);

  const fetchJournalEntries = async (userId) => {
    try {
      const response = await fetch(
        `/api/fetch-journal/journal?user_id=${userId}`
      );
      const data = await response.json();

      if (data.entries) {
        setJournalEntries(data.entries);
        console.log(data.entries);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>MindMap - Journals</title>
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
        <Box sx={{ flex: 1, mt: 3 }}>
          <Container sx={{ flex: 1, py: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="500"
              className={`${poppins.className}`}
              sx={{
                fontFamily: poppins.style.fontFamily,
                color: "#2D1B6B",
              }}
            >
              <span>{username}'s Journals</span>
            </Typography>

            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ mt: 4, mb: 4 }}
            >
              {/* Search Entry */}
              <Grid item xs={12} md={6} lg={5}>
                <TextField
                  placeholder="Search Entry"
                  variant="outlined"
                  fullWidth
                  sx={{
                    backgroundColor: "#f8f7fc",
                    borderRadius: 2,
                    width: "50rem",

                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8f7fe",

                      "& fieldset": {
                        borderColor: "#e0d8f8",
                      },

                      "&:hover fieldset": {
                        borderColor: "#5A33B7",
                      },

                      "&.Mui-focused fieldset": {
                        borderColor: "#5A33B7",
                        borderWidth: "2px",
                      },
                    },

                    // Input text
                    "& .MuiInputBase-input": {
                      fontFamily: poppins.style.fontFamily,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#5A33B7" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Apply Filter */}
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  sx={{
                    textTransform: "none",
                    fontFamily: poppins.style.fontFamily,
                    color: "#5A33B7",
                    borderColor: "#e0d8f8",
                    backgroundColor: "#f8f7fc",
                    borderRadius: 5,
                    px: 3,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "#ece7fa",
                      borderColor: "#d0c6f0",
                    },
                  }}
                >
                  Apply Filter
                </Button>
              </Grid>

              {/* Select Date */}
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<CalendarTodayIcon />}
                  sx={{
                    textTransform: "none",
                    fontFamily: poppins.style.fontFamily,
                    color: "#5A33B7",
                    borderColor: "#e0d8f8",
                    backgroundColor: "#f8f7fc",
                    borderRadius: 5,
                    px: 3,
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "#ece7fa",
                      borderColor: "#d0c6f0",
                    },
                  }}
                >
                  Select Date
                </Button>
              </Grid>
            </Grid>

            {/* Journal Cards */}
            <Grid container spacing={3} sx={{ mb: 20 }}>
              {loading ? (
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      fontFamily: poppins.style.fontFamily,
                      color: "#2D1B6B",
                      textAlign: "center",
                    }}
                  >
                    Loading journals...
                  </Typography>
                </Grid>
              ) : journalEntries.length === 0 ? (
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      fontFamily: poppins.style.fontFamily,
                      color: "#2D1B6B",
                      textAlign: "center",
                    }}
                  >
                    No journals found. Start writing your first entry!
                  </Typography>
                </Grid>
              ) : (
                journalEntries.map((entry) => (
                  <Grid item xs={12} sm={6} md={4} key={entry.id}>
                    <RecentJournal
                      journalID={entry.journal_id}
                      title={entry.title}
                      content={entry.journal_entry.default}
                      date={entry.date_created}
                      time={entry.time_created}
                    />
                  </Grid>
                ))
              )}
            </Grid>
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
