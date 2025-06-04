import Head from "next/head";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export default function AuthSuccess() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>MindMap - Email Verified</title>
        <meta
          name="description"
          content="Your email has been successfully verified. Welcome to MindMap!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `url('/assets/login_bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: "var(--font-poppins), sans-serif",
        }}
        className={`${raleway.variable} ${poppins.variable} ${quicksand.variable}`}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{ p: 5, borderRadius: 4, backdropFilter: "blur(10px)" }}
          >
            <Stack spacing={3} alignItems="center">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={2}
              >
                <Image
                  src="/assets/logo.png"
                  alt="Logo"
                  width={70}
                  height={70}
                />
                <Typography
                  variant="h4"
                  fontWeight={500}
                  sx={{
                    color: "#2D1B6B",
                    fontFamily: "var(--font-quicksand)",
                  }}
                >
                  MindMap
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                align="center"
                sx={{ color: "#2D1B6B", fontFamily: "var(--font-quicksand)" }}
              >
                The Journal Where Every Thought Maps Its Purpose
              </Typography>

              <CheckCircleIcon
                sx={{
                  fontSize: 80,
                  color: "#4CAF50",
                  my: 2,
                }}
              />

              <Typography
                variant="h5"
                fontWeight={600}
                align="center"
                sx={{
                  color: "#2D1B6B",
                  fontFamily: "var(--font-quicksand)",
                  mb: 1,
                }}
              >
                Email Verified Successfully!
              </Typography>

              <Alert
                severity="success"
                sx={{
                  width: "100%",
                  fontFamily: "var(--font-poppins)",
                  "& .MuiAlert-message": {
                    textAlign: "center",
                    width: "100%",
                  },
                }}
              >
                Your email address has been confirmed. You can now log in to
                your account and start using MindMap to elevate your mental
                wellness journey.
              </Alert>

              <Button
                fullWidth
                variant="contained"
                onClick={handleLoginRedirect}
                sx={{
                  bgcolor: "#4E2BBD",
                  borderRadius: "12px",
                  height: "3.3rem",
                  marginTop: "32px",
                  "&:hover": { bgcolor: "#3d22a3" },
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                }}
              >
                Go to Login
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{
                  color: "#5F518E",
                  fontFamily: "var(--font-quicksand)",
                  mt: 2,
                }}
              >
                Ready to start your journaling journey? Log in now to access
                your dashboard.
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
