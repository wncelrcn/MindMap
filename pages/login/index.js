import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Stack,
} from "@mui/material";
import Image from "next/image";
import { Raleway, Poppins, Quicksand } from "next/font/google";

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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <Head>
        <title>MindMap - Login</title>
        <meta
          name="description"
          content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
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
            sx={{
              p: 5,
              borderRadius: 4,
              backdropFilter: "blur(10px)",
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
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
                  fontWeight={400}
                  sx={{
                    color: "#2D1B6B",
                    fontFamily: "var(--font-quicksand)",
                  }}
                >
                  The Journal Where Every Thought Maps Its Purpose
                </Typography>

                <TextField
                  label="Email"
                  variant="standard"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputLabelProps={{
                    style: {
                      color: "#2D1B6B",
                      fontFamily: "var(--font-poppins)",
                    },
                  }}
                  inputProps={{
                    style: {
                      color: "#5F518E",
                      fontFamily: "var(--font-poppins)",
                    },
                  }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottom: "2px solid #2D1B6B",
                      fontFamily: "var(--font-poppins)",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "2px solid #1e1474",
                      fontFamily: "var(--font-poppins)",
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  variant="standard"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputLabelProps={{
                    style: {
                      color: "#2D1B6B",
                      fontFamily: "var(--font-poppins)",
                    },
                  }}
                  inputProps={{
                    style: {
                      color: "#5F518E",
                      fontFamily: "var(--font-poppins)",
                    },
                  }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottom: "2px solid #2D1B6B",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "2px solid #1e1474",
                    },
                    paddingBottom: "24px",
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: "#4E2BBD",
                    borderRadius: "12px",
                    height: "3.3rem",
                    marginTop: "32px",
                    fontFamily: "var(--font-poppins)",

                    "&:hover": {
                      bgcolor: "#3d22a3",
                    },
                  }}
                >
                  Login
                </Button>

                <Typography
                  align="center"
                  variant="body2"
                  fontWeight={400}
                  sx={{ fontFamily: "var(--font-quicksand)" }}
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    fontWeight={400}
                    onClick={() => router.push("/register")}
                    sx={{
                      color: "#0F54F8",
                      textDecoration: "underline",
                      "&:hover": { color: "#1e1474" },
                      fontFamily: "var(--font-quicksand)",
                    }}
                  >
                    Register here.
                  </Link>
                </Typography>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
