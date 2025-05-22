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
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { createClient } from "@/utils/supabase/component";

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

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate password match
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Validate password length
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!name || !email || !birthday || !gender) {
        setError("All fields are required");
        setLoading(false);
        return;
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name,
            birthday,
            gender,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Register user profile using the API
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email: email.trim().toLowerCase(),
            birthday,
            gender,
            user_UID: authData.user.id, // Pass the Supabase Auth UID
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create user profile");
        }

        // Redirect to login page
        router.push("/login?registered=true");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>MindMap - Register</title>
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
                  label="Email"
                  type="email"
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
                  label="Birthday"
                  type="date"
                  variant="standard"
                  fullWidth
                  required
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
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
                    "& .MuiInputLabel-root": {
                      color: "#2D1B6B",
                      fontSize: "18px",
                      fontFamily: "var(--font-poppins)",
                    },
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
                  label="Gender"
                  select
                  variant="standard"
                  fullWidth
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
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
                  label="Confirm Password"
                  type="password"
                  variant="standard"
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    paddingBottom: "24px",
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: "#4E2BBD",
                    borderRadius: "12px",
                    height: "3.3rem",
                    marginTop: "32px",
                    "&:hover": { bgcolor: "#3d22a3" },
                    fontFamily: "var(--font-poppins)",
                  }}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>

                <Typography
                  align="center"
                  variant="body2"
                  sx={{ fontFamily: "var(--font-quicksand)" }}
                >
                  Already have an account?{" "}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => router.push("/login")}
                    sx={{
                      color: "#0F54F8",
                      textDecoration: "underline",
                      "&:hover": { color: "#1e1474" },
                      fontFamily: "var(--font-quicksand)",
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
