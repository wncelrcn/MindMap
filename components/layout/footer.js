import Image from "next/image";
import { Box, Typography, Stack } from "@mui/material";
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

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#5c35c2",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: { xs: "2rem", md: "4rem 8rem" },
        flexWrap: "wrap",
      }}
    >
      {/* Left Section */}
      <Stack spacing={2}>
        <Box display="flex" alignItems="center">
          <Image
            alt="MindMap Logo"
            width={60}
            height={60}
            src="/assets/logo.png"
          />
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            marginBottom: "12px",
            fontSize: "2.5rem",
            fontFamily: quicksand.style.fontFamily,
          }}
        >
          MindMap
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={5}>
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                opacity: 0.8,
                mb: "4px",
                fontFamily: quicksand.style.fontFamily,
              }}
            >
              Email
            </Typography>
            <Typography
              sx={{ fontSize: "16px", fontFamily: quicksand.style.fontFamily }}
            >
              MindMap@gmail.com
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                opacity: 0.8,
                mb: "4px",
                fontFamily: quicksand.style.fontFamily,
              }}
            >
              Phone Number
            </Typography>
            <Typography
              sx={{ fontSize: "16px", fontFamily: quicksand.style.fontFamily }}
            >
              (049) 1122-234
            </Typography>
          </Box>
        </Box>
      </Stack>

      {/* Right Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "flex-start", md: "flex-end" },
          textAlign: { xs: "left", md: "right" },
          mt: { xs: 4, md: 0 },
        }}
      >
        <Box
          sx={{
            maxWidth: 320,
            fontSize: { xs: "24px", md: "32px" },
            fontWeight: 100,
            fontFamily: raleway.style.fontFamily,
          }}
        >
          The Journal Where Every Thought Maps Its Purpose
        </Box>
      </Box>
    </Box>
  );
}
