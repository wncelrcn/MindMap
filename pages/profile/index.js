import Head from "next/head";
import NextImage from "next/image";
import Footer from "@/components/layout/footer";
import SupportFooter from "@/components/layout/support_footer";
import Navbar from "@/components/layout/navbar";
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
} from "@mui/material";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/server-props";
import { supabase } from "@/lib/supabase";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SpaIcon from "@mui/icons-material/Spa";
import WorkIcon from "@mui/icons-material/Work";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import axios from "axios";

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
  const fileInputRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.email) {
        try {
          const { data, error } = await supabase
            .from("user_table")
            .select("username, profile_pic_url, about_me", "email")
            .eq("email", user.email)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
          } else {
            // Check profile picture URL
            if (data.profile_pic_url) {
              // Extract filename from URL
              const urlParts = data.profile_pic_url.split("/");
              const filename = urlParts[urlParts.length - 1];

              if (filename.includes(`${data.username}_profile.png`)) {
                // If filename contains username_profile.png or new_profile.png, use it
                // Add timestamp to prevent browser caching
                setProfilePicture(`${data.profile_pic_url}?t=${Date.now()}`);
              } else {
                // Otherwise check if it's a valid URL or use default
                const validUrl =
                  data.profile_pic_url &&
                  data.profile_pic_url.startsWith("http");
                setProfilePicture(
                  validUrl
                    ? `${data.profile_pic_url}?t=${Date.now()}`
                    : "/assets/default_profile.png"
                );
              }
            } else {
              // If no profile pic URL, use default
              setProfilePicture("/assets/default_profile.png");
            }

            setAboutMe(data.about_me || "");
            setNewAboutMe(data.about_me || "");
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
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
      // Check file size - reject if over 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }

      setSelectedFile(file);

      // Create a preview with canvas to optimize
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Use canvas to resize the image before preview
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
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

          // Get optimized preview URL and use for display
          const optimizedPreview = canvas.toDataURL("image/jpeg", 0.7);
          setPreviewUrl(optimizedPreview);
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
          // Get the base64 string
          let base64String = reader.result.split(",")[1];

          // If file is large, apply additional optimization in client
          if (selectedFile.size > 1 * 1024 * 1024) {
            // Create an image for canvas-based optimization
            const img = new Image();
            img.onload = async () => {
              const canvas = document.createElement("canvas");
              // Set to reasonable dimensions for a profile picture
              const MAX_DIM = 500;

              let width = img.width;
              let height = img.height;

              // Resize while keeping aspect ratio
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

              // Get optimized data URL
              const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

              // Extract base64 string
              base64String = optimizedDataUrl.split(",")[1];

              updateData.profileImage = {
                name: "profile_picture.jpg",
                type: "image/jpeg",
                data: base64String,
              };

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
            img.src = reader.result;
          } else {
            // Smaller files can proceed without client-side optimization
            updateData.profileImage = {
              name: selectedFile.name,
              type: selectedFile.type,
              data: base64String,
            };

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
          }
        };
      } else {
        // Just update aboutMe without image
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
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdating(false);
    }
  };

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
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 1)",
                zIndex: 10,
              }}
            >
              <CircularProgress
                size={60}
                thickness={4}
                sx={{
                  color: "#5C35C2",
                  marginTop: "-300px",
                }}
              />
            </Box>
          )}

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
              {/* Edit Profile Button */}
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

              {/* Profile Picture */}
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

              {/* Name with Gradient */}
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

              {/* About Me Section */}
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
              {/* Insights Section */}
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
                {/* Personality Card */}
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

                      {/* Purple zigzag icon */}
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

                  {/* Flip Icon */}
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

                {/* Recurring Journal Topics, Mascot, and Discover More */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  {/* Recurring Journal Topics */}
                  <Box
                    sx={{
                      backgroundColor: "#5C35C2",
                      borderRadius: 4,
                      p: 2.5,
                      color: "white",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: poppins.style.fontFamily,
                        mb: 2,
                        fontSize: "1.2rem",
                      }}
                    >
                      Recurring Journal Topics
                    </Typography>

                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <FavoriteIcon sx={{ mr: 1, fontSize: "1.4rem" }} />
                        <Typography
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            fontSize: "1rem",
                          }}
                        >
                          Interpersonal Relationship
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SpaIcon sx={{ mr: 1, fontSize: "1.4rem" }} />
                        <Typography
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            fontSize: "1rem",
                          }}
                        >
                          Personal Well-being and Emotional State
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <WorkIcon sx={{ mr: 1, fontSize: "1.4rem" }} />
                        <Typography
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            fontSize: "1rem",
                          }}
                        >
                          Work Life Balance
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: { xs: 2, sm: 3 },
                      flex: 1,
                    }}
                  >
                    {/* Total Journal Entries Card */}
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
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          fontWeight: 600,
                          mb: { xs: 1, sm: 2, md: 3 },
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          textAlign: "center",
                        }}
                      >
                        Journal Entries
                      </Typography>

                      <Typography
                        variant="h1"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          fontWeight: 700,
                          fontSize: { xs: "3.5rem", sm: "5rem", md: "6.5rem" },
                          lineHeight: 1,
                        }}
                      >
                        5
                      </Typography>
                    </Box>

                    {/* Streak Score Card */}
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
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          fontWeight: 600,
                          mb: { xs: 1, sm: 2, md: 3 },
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        Streak Score
                      </Typography>

                      <Typography
                        variant="h1"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          fontWeight: 700,
                          fontSize: { xs: "2.8rem", sm: "3.5rem", md: "4rem" },
                          lineHeight: 1,
                        }}
                      >
                        10
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 2,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-fire"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15" />
                        </svg>
                        <Typography
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            ml: 1,
                            fontSize: { xs: "0.7rem", sm: "0.9rem" },
                          }}
                        >
                          All Time High: 7
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Badges Section */}
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

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: { xs: 2, sm: 3 },
                  "& img": { maxWidth: "100%" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: { xs: 2, sm: 0 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 70, sm: 100 },
                      height: { xs: 70, sm: 100 },
                      mr: 2,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <NextImage
                      src="/assets/Group 47668.png"
                      alt="Mindfulness Badge"
                      fill
                      style={{ objectFit: "contain" }}
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
                      John's Mindfulness Practice
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: quicksand.style.fontFamily,
                        color: "#777",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    >
                      January
                    </Typography>
                  </Box>
                </Box>

                {/* Badge 2 - Journal Master */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: { xs: 2, sm: 0 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 70, sm: 100 },
                      height: { xs: 70, sm: 100 },
                      mr: 2,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <NextImage
                      src="/assets/Group 47669.png"
                      alt="Journal Master Badge"
                      fill
                      style={{ objectFit: "contain" }}
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
                      Journal Master
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: quicksand.style.fontFamily,
                        color: "#777",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    >
                      January
                    </Typography>
                  </Box>
                </Box>

                {/* Badge 3-6 - Unlocked Badge Placeholders */}
                {[...Array(4)].map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: { xs: 2, sm: index < 2 ? 2 : 0 },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 70, sm: 100 },
                        height: { xs: 70, sm: 100 },
                        mr: 2,
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <NextImage
                        src="/assets/Group 47671.png"
                        alt="Unlocked Badge"
                        fill
                        style={{ objectFit: "contain" }}
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
                        Complete your Goals to Unlock the Badge
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Footer Section */}
        <Box component="footer">
          <SupportFooter />
          <Footer />
        </Box>

        {/* Edit Profile Dialog */}
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
              {/* Profile Picture Upload */}
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

              {/* About Me Section */}
              <TextField
                label="About Me"
                multiline
                rows={4}
                value={newAboutMe}
                onChange={(e) => setNewAboutMe(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#5C35C2",
                    },
                    "&:hover fieldset": {
                      borderColor: "#5C35C2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5C35C2",
                    },
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
                "&:hover": {
                  backgroundColor: "#4527A0",
                },
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
