import Head from "next/head";
import Footer from "@/components/footer";
import SupportFooter from "@/components/support_footer";
import {
  Box,
  Container,
  Typography,
  useTheme,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from "@mui/material";
import Navbar from "@/components/navbar";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { createClient } from "@/utils/supabase/server-props";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

export async function getServerSideProps(context) {
  const supabase = createClient(context);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: data.user,
    },
  };
}

export default function WeeklyRecap({ user }) {
  const [username, setUsername] = useState(user.user_metadata.name);
  const [user_UID, setUser_UID] = useState(user.id);

  return (
    <>
      <Head>
        <title>MindMap - Weekly Recap</title>
        <meta
          name="description"
          content="Your weekly journaling insights and emotional wellness summary."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Navbar />
        {/* Main Content */}
        <Box sx={{ flex: 1, mt: 4 }}>
          <Typography>Recap</Typography>
        </Box>

        {/* Footer Section */}
        <Box component="footer">
          <SupportFooter />
          <Footer />
        </Box>
      </Box>
    </>
  );
}
