import Head from "next/head";
import NextImage from "next/image";
import Footer from "@/components/layout/footer";
import SupportFooter from "@/components/layout/support_footer";
import Navbar from "@/components/layout/navbar";
import RecurringJournalTopics from "@/components/profile/RecurringJournalTopics";
import JournalEntries from "@/components/profile/JournalEntries";
import StreakScore from "@/components/profile/StreakScore";
import Badges from "@/components/profile/Badges";
import Personality from "@/components/profile/Personality";
import {
  Box,
  Typography,
  Container,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/server-props";
import { supabase } from "@/lib/supabase";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import axios from "axios";
import Loading from "@/components/Loading";

// Font configurations
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

export default function Profile({ user }) {
  const [username, setUsername] = useState(user.user_metadata.name);
  const [user_UID, setUser_UID] = useState(user.id);
  const [profilePicture, setProfilePicture] = useState(
    "/assets/default_profile.png"
  );
  const [aboutMe, setAboutMe] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newAboutMe, setNewAboutMe] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [topThemes, setTopThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [personalityTitle, setPersonalityTitle] = useState();
  const [personalityDescription, setPersonalityDescription] = useState();
  const fileInputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.email) {
        try {
          const { data, error } = await supabase
            .from("user_table")
            .select("username, profile_pic_url, about_me")
            .eq("email", user.email)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
          } else {
            if (data.profile_pic_url) {
              const urlParts = data.profile_pic_url.split("/");
              const filename = urlParts[urlParts.length - 1];
              const validUrl =
                data.profile_pic_url && data.profile_pic_url.startsWith("http");
              setProfilePicture(
                validUrl
                  ? `${data.profile_pic_url}?t=${Date.now()}`
                  : "/assets/default_profile.png"
              );
            }
            setAboutMe(data.about_me || "");
            setNewAboutMe(data.about_me || "");
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    const fetchTopThemes = async () => {
      try {
        const response = await fetch("/api/profile/theme", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.topThemes && data.topThemes.length > 0) {
            setTopThemes(data.topThemes.map((item) => item.theme));
          }
        } else {
          console.error("Failed to fetch themes:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching themes:", error);
      } finally {
        setThemesLoading(false);
      }
    };

    const fetchBadgesAndStats = async () => {
      try {
        // Check for new badge unlocks
        const checkResponse = await axios.post(
          "/api/badges/check-unlock",
          {},
          {
            withCredentials: true,
          }
        );
        if (checkResponse.data.success) {
          // Fetch updated badges and stats
          const badgesResponse = await axios.get("/api/badges/user-badges", {
            withCredentials: true,
          });
          if (badgesResponse.data.success) {
            setBadges(badgesResponse.data.badges || []);
            setStats(badgesResponse.data.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching badges and stats:", error);
        // Set empty defaults on error to prevent complete failure
        setBadges([]);
        setStats(null);

        // Check if it's an authentication error
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error(
            "Authentication error in badges - user may need to re-login"
          );
        } else if (error.response?.status === 500) {
          console.error(
            "Server error in badges - may be RLS policy issue:",
            error.response?.data
          );
        }
      } finally {
        setBadgesLoading(false);
      }
    };

    const fetchPersonality = async () => {
      try {
        const response = await fetch("/api/profile/personality", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.personality) {
            setPersonalityTitle(data.personality.title);
            setPersonalityDescription(data.personality.description);
          }
        } else {
          console.error("Failed to fetch personality:", response.statusText);
          // Set default values if API fails
          setPersonalityTitle("Neutral Explorer");
          setPersonalityDescription(
            "Welcome! Since we're starting fresh, I've set you up with a Neutral Explorer personality. This is a balanced, curious, and adaptable persona designed to help you dive into any topic with an open mind."
          );
        }
      } catch (error) {
        console.error("Error fetching personality:", error);
        // Set default values if API fails
        setPersonalityTitle("Neutral Explorer");
        setPersonalityDescription(
          "Welcome! Since we're starting fresh, I've set you up with a Neutral Explorer personality. This is a balanced, curious, and adaptable persona designed to help you dive into any topic with an open mind."
        );
      }
    };

    const initialize = async () => {
      await Promise.all([
        fetchUserData(),
        fetchTopThemes(),
        fetchBadgesAndStats(),
        fetchPersonality(),
      ]);
      setLoading(false);
    };

    initialize();
  }, [user]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
    setNewAboutMe(aboutMe);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 10MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 400; // Increased slightly for better quality
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Use higher quality for preview but will compress more for upload
          setPreviewUrl(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (file, maxWidth = 300, quality = 0.6) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");

          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxWidth) {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          // Set white background for better compression
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          // Try different quality levels until we get under 800KB base64 string
          let currentQuality = quality;
          let base64String;

          do {
            base64String = canvas
              .toDataURL("image/jpeg", currentQuality)
              .split(",")[1];
            // Base64 adds ~33% overhead, so 800KB base64 ≈ 600KB actual
            if (base64String.length < 800000) break;
            currentQuality -= 0.1;
          } while (currentQuality > 0.1);

          resolve({
            data: base64String,
            size: base64String.length,
            quality: currentQuality,
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateProfile = async () => {
    if (!user || !user.email) return;
    setUpdating(true);

    try {
      const updateData = {
        user: {
          email: user.email,
          username: username,
          id: user.id,
        },
        aboutMe: newAboutMe,
      };

      if (selectedFile) {
        console.log("Original file size:", selectedFile.size);

        // Compress the image regardless of original size
        const compressed = await compressImage(selectedFile, 300, 0.7);
        console.log(
          "Compressed base64 size:",
          compressed.size,
          "Quality used:",
          compressed.quality
        );

        if (compressed.size > 1000000) {
          // If still > 1MB base64
          alert(
            "Image is too complex to compress adequately. Please try a simpler image or smaller file."
          );
          setUpdating(false);
          return;
        }

        updateData.profileImage = {
          name: "profile_picture.jpg",
          type: "image/jpeg",
          data: compressed.data,
        };
      }

      await postUpdate(updateData);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
      setUpdating(false);
    }
  };

  const postUpdate = async (updateData) => {
    try {
      const response = await axios.post(
        "/api/profile/update_profile",
        updateData
      );
      if (response.data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);

      // Handle specific error cases
      if (err.response?.status === 413) {
        const errorMessage =
          err.response?.data?.message ||
          "Image file is too large. Please try compressing the image or using a smaller file.";
        alert(errorMessage);
      } else if (err.response?.data?.error) {
        alert(
          `Error: ${err.response.data.error}\n${
            err.response.data.message || ""
          }`
        );
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>MindMap - Profile</title>
        <meta
          name="description"
          content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </Head>
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        sx={{ backgroundColor: "#FFFFFF" }}
      >
        <Navbar />
        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            py: 5,
            px: { xs: 1, md: 1 },
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 3, sm: 4, md: 10 },
              maxWidth: "1300px",
              mx: "auto",
            }}
          >
            {/* Left Section - Profile Information */}
            <Box
              sx={{
                flex: "0 0 auto",
                maxWidth: { xs: "100%", md: "35%" },
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: { xs: 4, md: 0 },
              }}
            >
              <Box
                onClick={handleOpenEditDialog}
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f5f5f7",
                  borderRadius: 2,
                  p: 1,
                  color: "#5C35C2",
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                <Typography
                  sx={{
                    mr: 1,
                    fontSize: "0.75rem",
                    fontFamily: poppins.style.fontFamily,
                  }}
                >
                  Edit Profile
                </Typography>
                <EditIcon fontSize="xs" />
              </Box>
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 180, sm: 200, md: 220 },
                  height: { xs: 180, sm: 200, md: 220 },
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  mb: 3,
                  mx: "auto",
                }}
              >
                <NextImage
                  src={profilePicture}
                  alt="Profile Picture"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
              <Typography
                variant="h2"
                component="h1"
                align="center"
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "4rem" },
                  mb: 3,
                  background:
                    "linear-gradient(90deg, #5C35C2 0%, #ED6D6C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {username}
              </Typography>
              <Box sx={{ mb: { xs: 2, md: 4 }, textAlign: "center", px: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    color: "#2D1B6B",
                    mb: { xs: 1, md: 2 },
                    mt: { xs: 1, md: 2 },
                    textAlign: "center",
                    fontSize: { xs: "1.3rem", md: "1.5rem" },
                  }}
                >
                  About Me
                </Typography>
                <Typography
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    color: "#2D1B6B",
                    lineHeight: 1.6,
                    textAlign: "center",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                >
                  {aboutMe}
                </Typography>
              </Box>
            </Box>
            {/* Right Section - Insights and Badges */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: raleway.style.fontFamily,
                  fontWeight: "bold",
                  color: "#5C35C2",
                  mb: { xs: 1.5, md: 2 },
                  fontSize: "1rem",
                }}
              >
                Insights
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 2, sm: 3 },
                  mb: { xs: 3, sm: 5 },
                }}
              >
                <Box
                  sx={{
                    flex: "0 0 auto",
                    width: { xs: "100%", sm: "40%" },
                    backgroundColor: isFlipped ? "#5C35C2" : "#f5f5f7",
                    borderRadius: 4,
                    p: 3,
                    position: "relative",
                    overflow: "hidden",
                    perspective: "1000px",
                    transition: "transform 0.6s, background-color 0.6s",
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Personality
                    isFlipped={isFlipped}
                    handleFlip={handleFlip}
                    personalityTitle={personalityTitle}
                    personalityDescription={personalityDescription}
                  />
                </Box>
                {/* Recurring Journal Topics */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <RecurringJournalTopics
                    topicTexts={topThemes}
                    loading={themesLoading}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: { xs: 2, sm: 3 },
                      flex: 1,
                    }}
                  >
                    {/* Journal Entries */}
                    <JournalEntries stats={stats} />
                    {/* Streak Score */}
                    <StreakScore stats={stats} />
                  </Box>
                </Box>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: raleway.style.fontFamily,
                  color: "#5C35C2",
                  fontWeight: "bold",
                  mb: 2,
                  mt: { xs: 4, md: 2 },
                  fontSize: "1rem",
                }}
              >
                Badges
              </Typography>
              <Badges badges={badges} badgesLoading={badgesLoading} />
            </Box>
          </Box>
        </Container>
        <Box component="footer" sx={{ mt: 12 }}>
          <SupportFooter />
          <Footer />
        </Box>
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
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
            <EditIcon sx={{ color: "#2D1B6B" }} />
            Edit Profile
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    overflow: "hidden",
                    mb: 2,
                    border: "3px solid #5C35C2",
                  }}
                >
                  {previewUrl ? (
                    <NextImage
                      src={previewUrl}
                      alt="Profile Preview"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <NextImage
                      src={profilePicture}
                      alt="Current Profile Picture"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "40px",
                      backgroundColor: "rgba(92, 53, 194, 0.7)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <PhotoCameraIcon sx={{ color: "white" }} />
                  </Box>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: poppins.style.fontFamily,
                    fontSize: "0.9rem",
                    color: "#555",
                    textAlign: "center",
                  }}
                >
                  Click to upload a new profile picture
                </Typography>
              </Box>
              <TextField
                label="About Me"
                multiline
                rows={4}
                value={newAboutMe}
                onChange={(e) => setNewAboutMe(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#5C35C2" },
                    "&:hover fieldset": { borderColor: "#5C35C2" },
                    "&.Mui-focused fieldset": { borderColor: "#5C35C2" },
                  },
                  "& .MuiFormLabel-root": {
                    fontFamily: poppins.style.fontFamily,
                    color: "#5C35C2",
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: poppins.style.fontFamily,
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleCloseEditDialog}
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
              onClick={handleUpdateProfile}
              disabled={updating}
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
              {updating ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Save"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
