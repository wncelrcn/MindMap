import Head from "next/head";
import NextImage from "next/image";
import Footer from "@/components/layout/footer";
import SupportFooter from "@/components/layout/support_footer";
import Navbar from "@/components/layout/navbar";
import RecurringJournalTopics from "@/components/profile/RecurringJournalTopics";
import {
  Box,
  Typography,
  Container,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  CircularProgress,
  Modal,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Chip,
  Fade,
  Zoom,
} from "@mui/material";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/server-props";
import { supabase } from "@/lib/supabase";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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

// Badge color effects mapping
const badgeEffects = {
  "soft-green-glow": {
    backgroundColor: "#4CAF50",
    boxShadow: "0 0 20px rgba(76, 175, 80, 0.6)",
  },
  "warm-blue-ripple": {
    backgroundColor: "#2196F3",
    boxShadow: "0 0 20px rgba(33, 150, 243, 0.6)",
  },
  "vibrant-purple-sparkle": {
    backgroundColor: "#9C27B0",
    boxShadow: "0 0 20px rgba(156, 39, 176, 0.6)",
  },
  "light-yellow-fade": {
    backgroundColor: "#FFEB3B",
    boxShadow: "0 0 20px rgba(255, 235, 59, 0.6)",
  },
  "rich-orange-pulse": {
    backgroundColor: "#FF9800",
    boxShadow: "0 0 20px rgba(255, 152, 0, 0.6)",
  },
  "deep-gold-radiant": {
    backgroundColor: "#FFD700",
    boxShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
  },
  "deep-indigo-starry": {
    backgroundColor: "#3F51B5",
    boxShadow: "0 0 20px rgba(63, 81, 181, 0.6)",
  },
  "golden-yellow-twinkle": {
    backgroundColor: "#FFC107",
    boxShadow: "0 0 20px rgba(255, 193, 7, 0.6)",
  },
  "soft-teal-swirl": {
    backgroundColor: "#009688",
    boxShadow: "0 0 20px rgba(0, 150, 136, 0.6)",
  },
  "emerald-green-glow": {
    backgroundColor: "#4CAF50",
    boxShadow: "0 0 20px rgba(76, 175, 80, 0.8)",
  },
  "soft-lavender-wave": {
    backgroundColor: "#E1BEE7",
    boxShadow: "0 0 20px rgba(225, 190, 231, 0.6)",
  },
  "bright-cyan-pulse": {
    backgroundColor: "#00BCD4",
    boxShadow: "0 0 20px rgba(0, 188, 212, 0.6)",
  },
  "fresh-green-bloom": {
    backgroundColor: "#8BC34A",
    boxShadow: "0 0 20px rgba(139, 195, 74, 0.6)",
  },
  "deep-silver-reflective": {
    backgroundColor: "#9E9E9E",
    boxShadow: "0 0 20px rgba(158, 158, 158, 0.6)",
  },
  "fiery-red-spark": {
    backgroundColor: "#F44336",
    boxShadow: "0 0 20px rgba(244, 67, 54, 0.6)",
  },
  "vivid-magenta-flame": {
    backgroundColor: "#E91E63",
    boxShadow: "0 0 20px rgba(233, 30, 99, 0.6)",
  },
};

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
        const checkResponse = await axios.post("/api/badges/check-unlock");
        if (checkResponse.data.success) {
          // Fetch updated badges and stats
          const badgesResponse = await axios.get("/api/badges/user-badges");
          if (badgesResponse.data.success) {
            setBadges(badgesResponse.data.badges || []);
            setStats(badgesResponse.data.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching badges and stats:", error);
      } finally {
        setBadgesLoading(false);
      }
    };

    const initialize = async () => {
      await Promise.all([
        fetchUserData(),
        fetchTopThemes(),
        fetchBadgesAndStats(),
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
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          setPreviewUrl(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
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
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
          let base64String = reader.result.split(",")[1];
          if (selectedFile.size > 1 * 1024 * 1024) {
            const img = new Image();
            img.onload = async () => {
              const canvas = document.createElement("canvas");
              const MAX_DIM = 500;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > MAX_DIM) {
                  height = Math.round((height * MAX_DIM) / width);
                  width = MAX_DIM;
                }
              } else {
                if (height > MAX_DIM) {
                  width = Math.round((width * MAX_DIM) / height);
                  height = MAX_DIM;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);
              base64String = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
              updateData.profileImage = {
                name: "profile_picture.jpg",
                type: "image/jpeg",
                data: base64String,
              };
              await postUpdate(updateData);
            };
            img.src = reader.result;
          } else {
            updateData.profileImage = {
              name: selectedFile.name,
              type: selectedFile.type,
              data: base64String,
            };
            await postUpdate(updateData);
          }
        };
      } else {
        await postUpdate(updateData);
      }
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
      alert("Failed to update profile. Please try again.");
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
                  {!isFlipped ? (
                    <>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: "#5C35C2",
                          mb: 2,
                          fontSize: "1rem",
                        }}
                      >
                        Personality
                      </Typography>
                      <Box sx={{ mb: "auto" }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: "#4527A0",
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: "1.75rem",
                          }}
                        >
                          The
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: "#4527A0",
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: "1.75rem",
                          }}
                        >
                          Resilient
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: "#4527A0",
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: "1.75rem",
                          }}
                        >
                          Quick-
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: "#4527A0",
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: "1.75rem",
                          }}
                        >
                          Thinking
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: "#4527A0",
                            fontWeight: 700,
                            fontSize: "1.75rem",
                          }}
                        >
                          Maverick
                        </Typography>
                      </Box>
                      <Box sx={{ position: "absolute", top: 20, right: 20 }}>
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M30 10L20 20L30 30L20 40"
                            stroke="#5C35C2"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: "white",
                          mb: 2,
                          fontSize: "1rem",
                        }}
                      >
                        Personality
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: "white",
                          lineHeight: 1.6,
                          fontSize: "1.05rem",
                        }}
                      >
                        You are a bold, independent thinker who thrives under
                        pressure, quickly adapts to challenges, and fearlessly
                        carves their own path, unafraid to challenge norms and
                        take risks to achieve their vision.
                      </Typography>
                    </>
                  )}
                  <IconButton
                    onClick={handleFlip}
                    sx={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      color: isFlipped ? "white" : "#5C35C2",
                      padding: "4px",
                    }}
                  >
                    <FlipCameraAndroidIcon fontSize="medium" />
                  </IconButton>
                </Box>
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
                    <Box
                      sx={{
                        flex: 1,
                        backgroundColor: "#5C35C2",
                        borderRadius: 4,
                        p: { xs: 1, sm: 1.5, md: 2 },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: { xs: "120px", sm: "auto" },
                        maxWidth: { xs: "49%", sm: "none" },
                        color: "white",
                        flexDirection: "column",
                        backgroundImage:
                          "url('/assets/profile/entries-bg.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          zIndex: 1,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            fontWeight: 600,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            textAlign: "center",
                          }}
                        >
                          Journal Entries
                        </Typography>
                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h1"
                            sx={{
                              fontFamily: poppins.style.fontFamily,
                              fontWeight: 700,
                              fontSize: {
                                xs: "3rem",
                                sm: "4rem",
                                md: "5rem",
                                lg: "6rem",
                              },
                              lineHeight: 1,
                              marginBottom: 2,
                            }}
                          >
                            {stats?.total_entries || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {/* Streak Score */}
                    <Box
                      sx={{
                        flex: 1,
                        backgroundColor: "#5C35C2",
                        borderRadius: 4,
                        p: { xs: 1, sm: 1.5, md: 2 },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: { xs: "120px", sm: "auto" },
                        maxWidth: { xs: "49%", sm: "none" },
                        color: "white",
                        flexDirection: "column",
                        backgroundImage: "url('/assets/profile/streak-bg.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          zIndex: 1,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            fontWeight: 600,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            textAlign: "center",
                          }}
                        >
                          Streak Score
                        </Typography>
                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="h1"
                            sx={{
                              fontFamily: poppins.style.fontFamily,
                              fontWeight: 700,
                              fontSize: {
                                xs: "3rem",
                                sm: "4rem",
                                md: "5rem",
                              },
                              lineHeight: 1,
                            }}
                          >
                            {stats?.current_streak || 0}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LocalFireDepartmentIcon sx={{ mr: 1 }} />
                          <Typography
                            sx={{
                              fontFamily: poppins.style.fontFamily,
                              fontSize: { xs: "0.7rem", sm: "0.9rem" },
                            }}
                          >
                            All Time High: {stats?.all_time_high_streak || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
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
              {badgesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress sx={{ color: "#5C35C2" }} />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                    },
                    gap: { xs: 2, sm: 3 },
                    mt: 5,
                  }}
                >
                  {badges.map((badge) => (
                    <Fade in={true} key={badge.id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: { xs: 2, sm: 0 },
                        }}
                      >
                        <Tooltip
                          title={
                            <Box>
                              <Typography
                                sx={{
                                  fontFamily: poppins.style.fontFamily,
                                  color: "white",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {badge.badges.description}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: quicksand.style.fontFamily,
                                  color: "#ccc",
                                  fontSize: "0.8rem",
                                  mt: 1,
                                }}
                              >
                                Criteria: {badge.badges.criteria}
                              </Typography>
                            </Box>
                          }
                          placement="top"
                        >
                          <Box
                            sx={{
                              width: { xs: 70, sm: 80 },
                              height: { xs: 70, sm: 80 },
                              mr: 2,
                              position: "relative",
                              flexShrink: 0,
                              borderRadius: "50%",
                              ...badgeEffects[badge.badges.color_effect],
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              p: 1,
                            }}
                          >
                            <NextImage
                              src={
                                badge.badges.image_url ||
                                "/assets/Group 47671.png"
                              }
                              alt={badge.badges.name}
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          </Box>
                        </Tooltip>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontFamily: poppins.style.fontFamily,
                              color: "#5C35C2",
                              fontWeight: 600,
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                            }}
                          >
                            {badge.badges.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: quicksand.style.fontFamily,
                              color: "#777",
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            }}
                          >
                            {new Date(badge.unlocked_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Fade>
                  ))}
                  {badges.length < 6 &&
                    [...Array(6 - badges.length)].map((_, index) => (
                      <Box
                        key={`placeholder-${index}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: { xs: 2, sm: 0 },
                          opacity: 0.6,
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 70, sm: 80 },
                            height: { xs: 70, sm: 80 },
                            mr: 2,
                            position: "relative",
                            flexShrink: 0,
                            borderRadius: "50%",
                            backgroundColor: "#e0e0e0",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <NextImage
                            src="/assets/Group 47671.png"
                            alt="Locked Badge"
                            fill
                            style={{ objectFit: "contain", opacity: 0.5 }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontFamily: poppins.style.fontFamily,
                              color: "#5C35C2",
                              fontWeight: 600,
                              fontSize: { xs: "0.9rem", sm: "1rem" },
                            }}
                          >
                            Locked Badge
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: quicksand.style.fontFamily,
                              color: "#777",
                              fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            }}
                          >
                            Complete goals to unlock
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Box>
              )}
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
        >
          <DialogTitle
            sx={{
              fontFamily: poppins.style.fontFamily,
              color: "#5C35C2",
              fontWeight: 600,
            }}
          >
            Edit Profile
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
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
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={handleCloseEditDialog}
              sx={{
                fontFamily: poppins.style.fontFamily,
                color: "#888",
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={updating}
              variant="contained"
              sx={{
                fontFamily: poppins.style.fontFamily,
                backgroundColor: "#5C35C2",
                "&:hover": { backgroundColor: "#4527A0" },
                px: 4,
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
