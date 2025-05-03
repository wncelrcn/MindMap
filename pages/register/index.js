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
  MenuItem,
} from "@mui/material";
import Image from "next/image";
import { Raleway, Poppins } from "next/font/google";

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

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, birthday, gender, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/login");
    } else {
      setError(data.message || "Registration failed");
    }
  };

  return (
    <>
      <Head>
        <title>Register</title>
        <meta name="description" content="Create a new account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
        className={`${raleway.variable} ${poppins.variable}`}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{ p: 5, borderRadius: 4, backdropFilter: "blur(10px)" }}
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
                    fontWeight={600}
                    sx={{ color: "#2D1B6B", fontFamily: "var(--font-raleway)" }}
                  >
                    MindMap
                  </Typography>
                </Stack>

                <Typography
                  variant="body1"
                  align="center"
                  sx={{ color: "#2D1B6B", fontFamily: "var(--font-raleway)" }}
                >
                  The Journal Where Every Thought Maps Its Purpose
                </Typography>

                {error && (
                  <Typography color="error" variant="body2" align="center">
                    {error}
                  </Typography>
                )}

                <TextField
                  label="Name"
                  variant="standard"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  InputLabelProps={{ style: { color: "#2D1B6B" } }}
                  inputProps={{ style: { color: "#5F518E" } }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottom: "2px solid #2D1B6B",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "2px solid #1e1474",
                    },
                  }}
                />

                <TextField
                  label="Email"
                  type="email"
                  variant="standard"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputLabelProps={{ style: { color: "#2D1B6B" } }}
                  inputProps={{ style: { color: "#5F518E" } }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottom: "2px solid #2D1B6B",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "2px solid #1e1474",
                    },
                  }}
                />

                <TextField
                  label="Birthday"
                  type="date"
                  variant="standard"
                  fullWidth
                  required
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{ style: { color: "#5F518E" } }}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "#2D1B6B",
                      fontSize: "18px",
                    },
                    "& .MuiInput-underline:before": {
                      borderBottom: "2px solid #2D1B6B",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "2px solid #1e1474",
                    },
                  }}
                />

                <TextField
                  label="Gender"
                  select
                  variant="standard"
                  fullWidth
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  InputLabelProps={{ style: { color: "#2D1B6B" } }}
                  inputProps={{ style: { color: "#5F518E" } }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottom: "2px solid #2D1B6B",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "2px solid #1e1474",
                    },
                  }}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>

                <TextField
                  label="Password"
                  type="password"
                  variant="standard"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputLabelProps={{ style: { color: "#2D1B6B" } }}
                  inputProps={{ style: { color: "#5F518E" } }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottom: "2px solid #2D1B6B",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottom: "2px solid #1e1474",
                    },
                  }}
                />

                <TextField
                  label="Confirm Password"
                  type="password"
                  variant="standard"
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputLabelProps={{ style: { color: "#2D1B6B" } }}
                  inputProps={{ style: { color: "#5F518E" } }}
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
                    "&:hover": { bgcolor: "#3d22a3" },
                  }}
                >
                  Register
                </Button>

                <Typography align="center" variant="body2">
                  Already have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => router.push("/login")}
                    sx={{
                      color: "#0F54F8",
                      textDecoration: "underline",
                      "&:hover": { color: "#1e1474" },
                    }}
                  >
                    Login here.
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
