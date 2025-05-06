import Head from "next/head";
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
import Navbar from "@/components/navbar";

export default function Profile() {
  return (
    <>
      <Box>
        <Navbar />
      </Box>
    </>
  );
}
