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
import RecentJournal from "@/components/recent_journal";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
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

export default function Journals({ user }) {
  const [username, setUsername] = useState(user.user_metadata.name);
  const [user_UID, setUser_UID] = useState(user.id);
  const [journalEntries, setJournalEntries] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchJournalEntries = async (userId) => {
      try {
        const response = await fetch(
          `/api/fetch-journal/journal?user_UID=${user_UID}`
        );
        const data = await response.json();

        if (data.entries) {
          setJournalEntries(data.entries);
          console.log(data.entries);
        }
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      }
    };

    fetchJournalEntries(user_UID);
  }, [user_UID]);

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
                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                mb: { xs: 2, sm: 0 },
              }}
            >
              <span>{username}'s Journals</span>
            </Typography>

            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ mt: 4, mb: 4 }}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              {/* Search Entry */}
              <Grid
                item
                xs={12}
                md={6}
                lg={5}
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                <TextField
                  placeholder="Search Entry"
                  variant="outlined"
                  fullWidth
                  sx={{
                    backgroundColor: "#f8f7fc",
                    borderRadius: 2,
                    width: { xs: "100%", md: "50rem" },

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

              {/* Button Container */}
              <Grid
                item
                container
                xs={12}
                md="auto"
                spacing={2}
                justifyContent={{ xs: "space-between", sm: "flex-start" }}
              >
                {/* Apply Filter */}
                <Grid item xs={5.5} sm="auto">
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    fullWidth
                    sx={{
                      textTransform: "none",
                      fontFamily: poppins.style.fontFamily,
                      color: "#5A33B7",
                      borderColor: "#e0d8f8",
                      backgroundColor: "#f8f7fc",
                      borderRadius: 5,
                      px: { xs: 1, sm: 3 },
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
                <Grid item xs={5.5} sm="auto">
                  <Button
                    variant="outlined"
                    startIcon={<CalendarTodayIcon />}
                    fullWidth
                    sx={{
                      textTransform: "none",
                      fontFamily: poppins.style.fontFamily,
                      color: "#5A33B7",
                      borderColor: "#e0d8f8",
                      backgroundColor: "#f8f7fc",
                      borderRadius: 5,
                      px: { xs: 1, sm: 3 },
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
            </Grid>

            {/* Journal Cards */}
            <Grid container spacing={3} sx={{ mb: 20 }}>
              {journalEntries.length === 0 ? (
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
                      journalType={entry.journal_type}
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
