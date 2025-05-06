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
  const theme = useTheme();

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
                    backgroundColor: "#f8f7fc", // fallback fill
                    borderRadius: 2, // outer corner radius
                    width: "50rem",

                    // Apply to the actual input wrapper (includes border & padding)
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px", // change this to your desired curve
                      backgroundColor: "#f8f7fe", // fill inside the box

                      // Default border
                      "& fieldset": {
                        borderColor: "#e0d8f8", // default border
                      },

                      // On hover
                      "&:hover fieldset": {
                        borderColor: "#5A33B7", // border on hover
                      },

                      // On focus
                      "&.Mui-focused fieldset": {
                        borderColor: "#5A33B7", // border on focus
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
              <RecentJournal />
              <RecentJournal />
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
