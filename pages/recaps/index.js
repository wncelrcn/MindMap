import Head from "next/head";
import Footer from "@/components/layout/footer";
import SupportFooter from "@/components/layout/support_footer";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from "@mui/material";
import Navbar from "@/components/layout/navbar";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import RecapCard from "@/components/cards/recap_card";

import { createClient } from "@/utils/supabase/server-props";
import { createClient as createComponentClient } from "@/utils/supabase/component";

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

export default function WeeklyRecap({ user }) {
  const [username, setUsername] = useState(user.user_metadata.name);
  const [user_UID, setUser_UID] = useState(user.id);
  const [recapEntries, setRecapEntries] = useState([]);
  const [filteredRecaps, setFilteredRecaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // UI states
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    const fetchRecaps = async () => {
      const supabase = createComponentClient();

      try {
        const { data, error } = await supabase
          .from("recap")
          .select(
            "user_UID, weekly_summary, mood, date_range_start, date_range_end, created_at, feeling, contributing, moments, cope, remember"
          )
          .eq("user_UID", user_UID)
          .order("date_range_start", { ascending: false });

        if (error) {
          console.error("Error fetching recaps:", error);
        } else {
          setRecapEntries(data || []);
          setFilteredRecaps(data || []);
        }
      } catch (error) {
        console.error("Error fetching recaps:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user_UID) {
      fetchRecaps();
    }
  }, [user_UID]);

  // Filter function
  useEffect(() => {
    let filtered = [...recapEntries];

    // Search filter
    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const summaryMatch = entry.weekly_summary
          ?.toLowerCase()
          .includes(lowercasedQuery);

        // Create a searchable string from the date range
        const startDate = new Date(entry.date_range_start);
        const endDate = new Date(entry.date_range_end);
        const searchableDate = `${startDate.toLocaleDateString("en-US", {
          month: "short",
        })} ${startDate.getDate()} - ${endDate.toLocaleDateString("en-US", {
          month: "short",
        })} ${endDate.getDate()} ${startDate.toLocaleDateString("en-US", {
          month: "long",
        })} ${endDate.toLocaleDateString("en-US", {
          month: "long",
        })}`.toLowerCase();

        const dateMatch = searchableDate.includes(lowercasedQuery);

        return summaryMatch || dateMatch;
      });
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((entry) => {
        const recapStartDate = new Date(entry.date_range_start);
        const recapEndDate = new Date(entry.date_range_end);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && endDate) {
          // Check for overlap between the recap's range and the selected range
          return recapStartDate <= endDate && recapEndDate >= startDate;
        } else if (startDate) {
          // If only start date is selected, check if recap range includes it
          return startDate >= recapStartDate && startDate <= recapEndDate;
        } else if (endDate) {
          // If only end date is selected, check if recap range includes it
          return endDate >= recapStartDate && endDate <= recapEndDate;
        }
        return true;
      });
    }
    setFilteredRecaps(filtered);
  }, [recapEntries, searchQuery, dateRange]);

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle date dialog
  const handleDateDialogOpen = () => {
    setTempDateRange(dateRange);
    setDateDialogOpen(true);
  };

  const handleDateDialogClose = () => {
    setDateDialogOpen(false);
    setTempDateRange({ start: "", end: "" });
  };

  const handleDateRangeApply = () => {
    setDateRange(tempDateRange);
    setDateDialogOpen(false);
  };

  const clearDateRange = () => {
    setDateRange({ start: "", end: "" });
    setTempDateRange({ start: "", end: "" });
    setDateDialogOpen(false);
  };

  // Format date for display
  const formatDateRange = () => {
    if (dateRange.start && dateRange.end) {
      return `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(
        dateRange.end
      ).toLocaleDateString()}`;
    } else if (dateRange.start) {
      return `On ${new Date(dateRange.start).toLocaleDateString()}`;
    } else if (dateRange.end) {
      return `Until ${new Date(dateRange.end).toLocaleDateString()}`;
    }
    return "Select Date";
  };

  return (
    <>
      <Head>
        <title>MindMap - Recaps</title>
        <meta
          name="description"
          content="Your weekly journaling insights and emotional wellness summary."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Navbar />

        {/* Main Content */}
        <Box sx={{ flex: 1, mt: 3 }}>
          <Container sx={{ flex: 1, py: 4 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="500"
                className={`${poppins.className}`}
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  color: "#2D1B6B",
                  fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                }}
              >
                <span>{username}'s Recaps</span>
              </Typography>
            </Box>

            <Grid
              container
              spacing={2}
              alignItems="stretch"
              px={{ xs: 2, sm: 4, md: 1 }}
              sx={{ mt: 4, mb: 4, flexWrap: "nowrap" }}
            >
              {/* Search Entry */}
              <Grid
                item
                xs
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  maxWidth: "100%",
                  display: "flex",
                  alignItems: "stretch",
                }}
              >
                <TextField
                  placeholder="Search Recaps"
                  variant="outlined"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  fullWidth
                  sx={{
                    backgroundColor: "#f8f7fc",
                    borderRadius: 2,
                    width: "100%",
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
                sx={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "stretch",
                  gap: 2,
                }}
              >
                {/* Select Date */}
                <Button
                  variant="outlined"
                  startIcon={<CalendarTodayIcon />}
                  onClick={handleDateDialogOpen}
                  sx={{
                    textTransform: "none",
                    fontFamily: poppins.style.fontFamily,
                    color:
                      dateRange.start || dateRange.end ? "#fff" : "#5A33B7",
                    borderColor: "#e0d8f8",
                    backgroundColor:
                      dateRange.start || dateRange.end ? "#5A33B7" : "#f8f7fc",
                    borderRadius: 5,
                    px: { xs: 1, sm: 3 },
                    py: 1.5,
                    height: "100%",
                    "&:hover": {
                      backgroundColor:
                        dateRange.start || dateRange.end
                          ? "#4a2a9a"
                          : "#ece7fa",
                      borderColor: "#d0c6f0",
                    },
                  }}
                >
                  {formatDateRange()}
                </Button>
              </Grid>
            </Grid>
            {/* Active Filters Display */}
            {(searchQuery || dateRange.start || dateRange.end) && (
              <Box sx={{ mb: 3, px: { xs: 2, sm: 4, md: 1 } }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    color: "#5A33B7",
                    mb: 1,
                  }}
                >
                  Active filters: {searchQuery && `Search: "${searchQuery}"`}
                  {searchQuery && (dateRange.start || dateRange.end) && " • "}
                  {(dateRange.start || dateRange.end) &&
                    `Date: ${formatDateRange()}`}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    color: "#666",
                  }}
                >
                  Showing {filteredRecaps.length} of {recapEntries.length}{" "}
                  recaps
                </Typography>
              </Box>
            )}

            {/* Recap Cards */}
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 20 }}>
              {loading ? (
                <Typography>Loading recaps...</Typography>
              ) : filteredRecaps.length > 0 ? (
                filteredRecaps.map((recap, index) => (
                  <Grid item key={index} xs={12} sm={6} md={4}>
                    <RecapCard
                      recap={recap}
                      count={filteredRecaps.length - index}
                    />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      fontFamily: poppins.style.fontFamily,
                      color: "#2D1B6B",
                      textAlign: "center",
                      mt: 4,
                    }}
                  >
                    {recapEntries.length === 0
                      ? "No recaps found. Your weekly recaps will appear here."
                      : "No recaps match your current filters. Try adjusting your search criteria."}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>

        {/* Date Range Dialog */}
        <Dialog
          open={dateDialogOpen}
          onClose={handleDateDialogClose}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 3,
              p: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "#2D1B6B",
              fontWeight: 600,
            }}
          >
            Select Date or Date Range
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={tempDateRange.start}
                onChange={(e) =>
                  setTempDateRange({ ...tempDateRange, start: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": {
                      borderColor: "#5A33B7",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5A33B7",
                    },
                  },
                }}
              />
              <TextField
                label="End Date"
                type="date"
                value={tempDateRange.end}
                onChange={(e) =>
                  setTempDateRange({ ...tempDateRange, end: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": {
                      borderColor: "#5A33B7",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5A33B7",
                    },
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                Select a single date to find the recap for that week, or a range
                to find all recaps that overlap with that period.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={clearDateRange}
              sx={{
                color: "#666",
                fontFamily: poppins.style.fontFamily,
                textTransform: "none",
              }}
            >
              Clear
            </Button>
            <Button
              onClick={handleDateDialogClose}
              sx={{
                color: "#666",
                fontFamily: poppins.style.fontFamily,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDateRangeApply}
              variant="contained"
              sx={{
                backgroundColor: "#5A33B7",
                fontFamily: poppins.style.fontFamily,
                textTransform: "none",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#4a2a9a",
                },
              }}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        {/* Footer Section */}
        <Box component="footer">
          <SupportFooter />
          <Footer />
        </Box>
      </Box>
    </>
  );
}
