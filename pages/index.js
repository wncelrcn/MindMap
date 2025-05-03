import Head from "next/head";
import { Poppins } from "next/font/google";
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
import LandingHeader from "@/components/landing_header";

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

export default function Home() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    async function checkConnection() {
      const { data, error } = await supabase
        .from("user_table")
        .select("*")
        .limit(1);
      if (error) {
        console.error("Connection error:", error);
        setStatus(`❌ Error: ${error.message}`);
      } else {
        console.log("Connection successful:", data);
        setStatus("✅ Connected to Supabase!");
      }
    }
    checkConnection();
  }, []);

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
          <Container
            maxWidth="lg"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              textAlign: "left",
            }}
          >
            {/* Features Section */}
            <Typography
              variant="h4"
              sx={{
                mt: 8,
                mb: 4,
                fontWeight: 700,
                background: "linear-gradient(90deg, #563CA5 0%, #E25C59 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "left",
              }}
            >
              What can it do?
            </Typography>

            {/* Carousel Placeholder */}
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                gap: 4,
                py: 4,
                width: "100%",
                pr: 2,
              }}
            >
              {[1, 2, 3, 4].map((item) => (
                <Box
                  key={item}
                  sx={{ minWidth: 260, flexShrink: 0, textAlign: "center" }}
                >
                  <Box
                    component="img"
                    src={`/assets/feature_placeholder_${item}.png`}
                    alt="Feature Illustration Placeholder"
                    sx={{ width: "100%", maxWidth: 200, mb: 2, mx: "auto" }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{
                      backgroundColor: "#E5E0FA",
                      px: 2,
                      py: 1,
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    Feature Title
                  </Typography>
                  <Typography variant="body1">
                    Brief description of this feature goes here, explaining the
                    benefit to the user.
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>

          {/* Connection Status - Only visible during development */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4, opacity: 0.7 }}
          >
            {status}
          </Typography>
        </Container>
      </div>
    </ThemeProvider>
  );
}
