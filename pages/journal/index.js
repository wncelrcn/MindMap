import Navbar from "@/components/navbar";
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
import Image from "next/image";

export default function Journal() {
  return (
    <>
      <Box>
        <Navbar />
        <Box position="relative" width="100%" height="234px">
          <Box
            position="absolute"
            top={16}
            zIndex={1}
            sx={{ padding: { xs: "1.5rem", md: "2rem 8rem" } }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#2D1B6B"
            >
              <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
            </svg>
          </Box>

          <Image
            src="/assets/header.png"
            alt="Journal"
            layout="fill"
            objectFit="cover"
            priority
          />
        </Box>
      </Box>
    </>
  );
}
