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
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import { requireAuth } from "@/lib/requireAuth";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/navbar";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

export default function GuidedJournaling({ user }) {
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

  const journalingCategories = [
    {
      title: "Journaling",
      description: "Structure your journaling practice and get clarity.",
      image: "/assets/person-1.png",
      gradient: "linear-gradient(135deg, #d2c7f2 0%, #e4b1dc 100%)",
    },
    {
      title: "Productivity",
      description: "Stay focused and organized to maximize your time.",
      image: "/assets/person-2.png",
      gradient:
        "linear-gradient(135deg, #faebf0 0%, #f9cfe4 50%, #eae1f5 100%)",
    },
    {
      title: "Growth",
      description: "Track progress and push yourself to improve.",
      image: "/assets/person-3.png",
      gradient:
        "linear-gradient(135deg, #faebf0 0%, #f9cfe4 50%, #eae1f5 100%)",
    },
    {
      title: "Self-Reflection",
      description: "Gain clarity and self-awareness through writing.",
      image: "/assets/person-4.png",
      gradient: "linear-gradient(135deg, #d2c7f2 0%, #e4b1dc 100%)",
    },
    {
      title: "Problem-Solving",
      description: "Break down challenges and find effective solutions.",
      image: "/assets/person-5.png",
      gradient: "linear-gradient(135deg, #d2c7f2 0%, #e4b1dc 100%)",
    },
    {
      title: "Creative Expression",
      description: "Spark ideas and bring creativity to life.",
      image: "/assets/person-6.png",
      gradient:
        "linear-gradient(135deg, #faebf0 0%, #f9cfe4 50%, #eae1f5 100%)",
    },
  ];

  return (
    <>
      <Head>
        <title>MindMap - Guided Journaling</title>
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
        <Box>
          <Link href="/create-entry" passHref>
            <Button
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "#2D1B6B",
                "&:hover": {
                  backgroundColor: "transparent",
                },
                minWidth: "auto",
                padding: { xs: "1rem", md: "1rem 8rem" },
              }}
            />
          </Link>
        </Box>
        <Container
          sx={{
            flex: 1,
            maxWidth: "lg",
            padding: { xs: "2rem", md: "1.5rem 8rem" },
          }}
        >
          <Box sx={{ maxWidth: { xs: "350px", md: "750px" }, mx: "auto" }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="500"
              className={`${poppins.className}`}
              sx={{
                fontFamily: poppins.style.fontFamily,
                color: "#2D1B6B",
                mb: 2,
              }}
            >
              {username}'s Guided Journaling
            </Typography>

            <Typography
              variant="body1"
              className={`${quicksand.className}`}
              sx={{
                fontFamily: quicksand.style.fontFamily,
                color: "#2D1B6B",
                mb: 6,
                fontSize: { xs: "1rem", md: "1.2rem" },
                fontWeight: 400,
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              With thought-provoking prompts and insightful guidance, this
              journal helps you navigate your thoughts, set meaningful goals,
              and track your progress.
            </Typography>
          </Box>

          <Box sx={{ maxWidth: "900px", mx: "auto" }}>
            <Grid container spacing={3} sx={{ justifyContent: "center" }}>
              {journalingCategories.map((category, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  key={index}
                  sx={{ maxWidth: { xs: "360px", md: "360px" } }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      border: `3px solid #2D1B6B`,
                      height: "100%",
                      width: "100%",
                      background: category.gradient,
                      transition:
                        "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        cursor: "pointer",
                      },
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <Box
                        component="img"
                        src={category.image}
                        alt={category.title}
                        sx={{
                          height: { xs: "250px", md: "300px" },
                          width: "auto",
                          maxWidth: "100%",
                          display: "block",
                          mx: "auto",
                          mb: 2,
                        }}
                      />
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          variant="h5"
                          component="h2"
                          fontWeight="400"
                          className={`${poppins.className}`}
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: "#2D1B6B",
                            mb: 1,
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            px: 2,
                          }}
                        >
                          {category.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          className={`${quicksand.className}`}
                          sx={{
                            fontFamily: quicksand.style.fontFamily,
                            color: "#2D1B6B",
                            fontWeight: 500,
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            px: 2,
                          }}
                        >
                          {category.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>

        {/* Footer Section */}
        <Box component="footer" sx={{ mt: 10 }}>
          <SupportFooter />
          <Footer />
        </Box>
      </Box>
    </>
  );
}
