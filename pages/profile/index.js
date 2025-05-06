import Head from "next/head";
import Footer from "@/components/footer";
import SupportFooter from "@/components/support_footer";
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

      {/* Footer Section */}
      <Box component="footer">
        <SupportFooter />
        <Footer />
      </Box>
    </>
  );
}
