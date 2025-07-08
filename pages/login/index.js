import Head from "next/head";
import { useState, useEffect } from "react";
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
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { createClient } from "@/utils/supabase/component";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState("");

  useEffect(() => {
    if (router.query.registered) {
      setSuccessMessage(
        "Registration successful! Please check your email to verify your account."
      );
    }
  }, [router.query]);

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      setSuccessMessage(
        "Verification email has been resent. Please check your inbox."
      );
      setVerificationError("");
      setInvalidCredentials("");
    } catch (err) {
      console.error("Resend error:", err);
      setVerificationError(
        "Failed to resend verification email. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setVerificationError("");
    setInvalidCredentials("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setVerificationError("Please verify your email before logging in.");
          return;
        }
        if (error.message.includes("Invalid login credentials")) {
          setInvalidCredentials("Invalid email or password. Please try again.");
          return;
        }
        throw error;
      }

      if (data?.user) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
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

                {successMessage &&
                  !verificationError &&
                  !invalidCredentials && (
                    <Alert
                      severity="success"
                      sx={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {successMessage}
                    </Alert>
                  )}

                {verificationError && (
                  <Alert
                    severity="error"
                    sx={{ fontFamily: "var(--font-poppins)" }}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                      >
                        {resendLoading ? "Sending..." : "Resend Email"}
                      </Button>
                    }
                  >
                    {verificationError}
                  </Alert>
                )}

                {invalidCredentials && (
                  <Alert
                    severity="error"
                    sx={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {invalidCredentials}
                  </Alert>
                )}

                {error && !verificationError && !invalidCredentials && (
                  <Typography color="error" variant="body2" align="center">
                    {error}
                  </Typography>
                )}

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
                  label="Password"
                  type={showPassword ? "text" : "password"}
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{ marginBottom: "8px" }}
                      >
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                          size="small"
                          sx={{
                            color: "#2D1B6B",
                            padding: "4px",
                            "& .MuiSvgIcon-root": {
                              fontSize: "1.2rem",
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                  {loading ? "Logging In" : "Login"}
                </Button>

                <Typography
                  align="center"
                  variant="body2"
                  sx={{ fontFamily: "var(--font-quicksand)" }}
                >
                  Don't have an account?{" "}
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
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
