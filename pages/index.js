import Head from "next/head";
import { Poppins } from "next/font/google";
import { Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Typography,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import LandingHeader from "@/components/layout/landing_header";
import FeatureCarousel from "@/components/layout/feature_carousel";
import TestimonialCarousel from "@/components/layout/testimonial_carousel";
import Footer from "@/components/layout/footer";
import SupportFooter from "@/components/layout/support_footer";
import Loading from "@/components/Loading";

// Configure Poppins font
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Create theme with Poppins
const theme = createTheme({
  palette: {
    primary: { main: "#5E35B1" },
    background: { default: "#FFFFFF" },
  },
  typography: { fontFamily: poppins.style.fontFamily },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          textTransform: "none",
          fontWeight: 600,
          padding: "16px 32px",
          fontSize: "1.125rem",
        },
      },
    },
  },
});

const myFeatures = [
  {
    id: 1,
    title: "Guided Journaling",
    description:
      "Write freely or use guided prompts to explore your thoughts and emotions.",
    image: "/assets/carousel/1.png",
  },
  {
    id: 2,
    title: "Personalized Coping Strategies",
    description:
      "Receive personalized mindfulness exercises and self-care tips based on your journal insights.",
    image: "/assets/carousel/2.png",
  },
  {
    id: 3,
    title: "Gamified Wellness Goals",
    description:
      "Set personalized wellness goals, earn points, and unlock badges for self-care milestones.",
    image: "/assets/carousel/3.png",
  },
  {
    id: 4,
    title: "Emotion Tracking",
    description:
      "Gain insights into your emotional patterns with analysis and visual graphs.",
    image: "/assets/carousel/4.png",
  },
  {
    id: 5,
    title: "Emergency Support",
    description:
      "Quick access to crisis hotlines, emergency contacts, and guided calming exercises.",
    image: "/assets/carousel/5.png",
  },
];

const myTestimonials = [
  {
    id: 1,
    name: "Michael Jones",
    role: "Mapúa MCL Student",
    quote:
      "Using this app daily has significantly improved my productivity and mental well-being...",
    image: "/assets/testimonials/1.png",
  },
  {
    id: 2,
    name: "Jane Doe",
    role: "Mapúa MCL Student",
    quote:
      "MindMap has completely changed how I organize my thoughts. Being able to visually map out my ideas reduces my anxiety and helps me achieve my goals.",
    image: "/assets/testimonials/2.png",
  },
  {
    id: 3,
    name: "Alex Smith",
    role: "Mapúa MCL Student",
    quote:
      "I've tried many productivity apps, but this one stands out for its intuitive design and helpful features. It's become an essential part of my daily routine.",
    image: "/assets/testimonials/1.png",
  },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={poppins.className}>
        <Head>
          <title>
            MindMap - The Journal Where Every Thought Maps Its Purpose
          </title>
          <meta
            name="description"
            content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/assets/logo.png" />
        </Head>

        <LandingHeader />

        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: "column",
            py: 5,
            textAlign: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          {/* Hero Section */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 700,
              mb: 5,
              mt: 8,
              background: "linear-gradient(90deg, #563CA5 0%, #E25C59 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Journal Where Every Thought Maps Its Purpose
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              mb: 8,
              width: { xs: "100%", md: "70%" },
              color: "#333",
            }}
          >
            Elevate your mental wellness, mindset, and cognitive strength with
            the next level of journaling.
          </Typography>

          <Box
            component="img"
            src="/assets/landing_mobile_app.png"
            alt="MindMap App Preview"
            sx={{ width: "100%", maxWidth: 700, height: "auto", mb: 5 }}
          />

          <Link href="/login" passHref style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ py: 2, px: 5, fontSize: "1.25rem", fontWeight: 500, mb: 5 }}
            >
              Map your Mind Now!
            </Button>
          </Link>

          {/* GIF Demo Placeholder */}
          <Box
            component="img"
            src="/assets/wizzydemo.gif"
            alt="Demo GIF Placeholder"
            sx={{
              width: "100%",
              maxWidth: 800,
              height: "auto",
              my: 5,
              mt: 15,
              mb: 15,
              opacity: 0.4,
              border: "2px dashed #ccc",
            }}
          />
        </Container>

        {/* Features and Testimonials Section - Fixed Container */}
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: "column",
            px: { xs: 2, sm: 3, md: 4 },
            pb: 8,
          }}
        >
          {/* Features Section */}
          <Typography
            variant="h4"
            sx={{
              mt: 8,
              mb: 4,
              fontWeight: 700,
              background: "linear-gradient(90deg, #563CA5 0%, #E25C59 30%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: { xs: "center", md: "left" },
              fontSize: { xs: "1.8rem", md: "2.125rem" },
            }}
          >
            What can it do?
          </Typography>

          <Box sx={{ mb: 6 }}>
            <FeatureCarousel features={myFeatures} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              mt: 10,
              mb: 4,
              fontWeight: 700,
              background: "linear-gradient(90deg, #563CA5 0%, #E25C59 50%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: { xs: "center", md: "left" },
              fontSize: { xs: "1.8rem", md: "2.125rem" },
            }}
          >
            What do our users say?
          </Typography>

          {/* Testimonials Section with better responsive handling */}
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              mb: 6,
            }}
          >
            <TestimonialCarousel testimonials={myTestimonials} />
          </Box>
        </Container>

        {/* Footer Section */}
        <Box component="footer" sx={{ mt: 10 }}>
          <SupportFooter />
          <Footer />
        </Box>
      </div>
    </ThemeProvider>
  );
}
