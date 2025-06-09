import Head from "next/head";
import Footer from "@/components/layout/footer";
import SupportFooter from "@/components/layout/support_footer";
import {
  Box,
  Container,
  Typography,
  useTheme,
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
import RecentJournal from "@/components/cards/recent_journal";
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
  const [filteredEntries, setFilteredEntries] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJournalType, setSelectedJournalType] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // UI states
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({ start: "", end: "" });

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
          setFilteredEntries(data.entries);
          console.log(data.entries);
        }
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      }
    };

    fetchJournalEntries(user_UID);
  }, [user_UID]);

  // Filter function
  useEffect(() => {
    let filtered = [...journalEntries];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (entry) =>
          entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.journal_entry?.default
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Journal type filter
    if (selectedJournalType) {
      filtered = filtered.filter(
        (entry) => entry.journal_type === selectedJournalType
      );
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date_created);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && endDate) {
          return entryDate >= startDate && entryDate <= endDate;
        } else if (startDate) {
          return entryDate >= startDate;
        } else if (endDate) {
          return entryDate <= endDate;
        }
        return true;
      });
    }

    setFilteredEntries(filtered);
  }, [journalEntries, searchQuery, selectedJournalType, dateRange]);

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle filter menu
  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleJournalTypeSelect = (type) => {
    const journalTypeMap = {
      "Free Journaling": "freeform",
      "Guided Journaling": "guided",
    };
    setSelectedJournalType(journalTypeMap[type]);
    handleFilterClose();
  };

  const clearFilters = () => {
    setSelectedJournalType("");
    setDateRange({ start: "", end: "" });
    setSearchQuery("");
    handleFilterClose();
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
      return `From ${new Date(dateRange.start).toLocaleDateString()}`;
    } else if (dateRange.end) {
      return `Until ${new Date(dateRange.end).toLocaleDateString()}`;
    }
    return "Select Date";
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
            {/* Centered Title */}
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
                <span>{username}'s Journals</span>
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
                  placeholder="Search Entry"
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
                {/* Apply Filter */}
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleFilterClick}
                  sx={{
                    textTransform: "none",
                    fontFamily: poppins.style.fontFamily,
                    color: selectedJournalType ? "#fff" : "#5A33B7",
                    borderColor: "#e0d8f8",
                    backgroundColor: selectedJournalType
                      ? "#5A33B7"
                      : "#f8f7fc",
                    borderRadius: 5,
                    px: { xs: 1, sm: 3 },
                    py: 1.5,
                    height: "100%",
                    "&:hover": {
                      backgroundColor: selectedJournalType
                        ? "#4a2a9a"
                        : "#ece7fa",
                      borderColor: "#d0c6f0",
                    },
                  }}
                >
                  {selectedJournalType === "freeform"
                    ? "Free Journaling"
                    : selectedJournalType === "guided"
                    ? "Guided Journaling"
                    : "Apply Filter"}
                </Button>
                <Menu
                  anchorEl={filterMenuAnchor}
                  open={Boolean(filterMenuAnchor)}
                  onClose={handleFilterClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: 2,
                      minWidth: 180,
                    },
                  }}
                >
                  <MenuItem 
                    onClick={() => handleJournalTypeSelect("Free Journaling")}
                    sx={{ 
                      fontFamily: poppins.style.fontFamily,
                      py: 1.5,
                    }}
                  >
                    Free Journaling
                  </MenuItem>
                  <MenuItem 
                    onClick={() => handleJournalTypeSelect("Guided Journaling")}
                    sx={{ 
                      fontFamily: poppins.style.fontFamily,
                      py: 1.5,
                    }}
                  >
                    Guided Journaling
                  </MenuItem>
                  {selectedJournalType && (
                    <MenuItem 
                      onClick={clearFilters}
                      sx={{ 
                        fontFamily: poppins.style.fontFamily,
                        py: 1.5,
                        color: '#666',
                      }}
                    >
                      Clear Filter
                    </MenuItem>
                  )}
                </Menu>
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
            {(searchQuery ||
              selectedJournalType ||
              dateRange.start ||
              dateRange.end) && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    color: "#5A33B7",
                    mb: 1,
                  }}
                >
                  Active filters: {searchQuery && `Search: "${searchQuery}"`}
                  {searchQuery &&
                    (selectedJournalType || dateRange.start || dateRange.end) &&
                    " • "}
                  {selectedJournalType &&
                    `Type: ${
                      selectedJournalType === "freeform"
                        ? "Free Journaling"
                        : "Guided Journaling"
                    }`}
                  {selectedJournalType &&
                    (dateRange.start || dateRange.end) &&
                    " • "}
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
                  Showing {filteredEntries.length} of {journalEntries.length}{" "}
                  entries
                </Typography>
              </Box>
            )}

            {/* Journal Cards */}
            <Grid
              container
              spacing={3}
              sx={{ mb: 20 }}
              justifyContent={{ xs: "center", md: "center" }}
            >
              {filteredEntries.length === 0 ? (
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      fontFamily: poppins.style.fontFamily,
                      color: "#2D1B6B",
                      textAlign: "center",
                    }}
                  >
                    {journalEntries.length === 0
                      ? "No journals found. Start writing your first entry!"
                      : "No journals match your current filters. Try adjusting your search criteria."}
                  </Typography>
                </Grid>
              ) : (
                filteredEntries.map((entry) => (
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
            Select Date Range
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
                Leave either field empty to filter from/until a specific date
                only.
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
