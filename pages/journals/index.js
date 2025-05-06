import Head from "next/head";
import Footer from "@/components/footer";
import SupportFooter from "@/components/support_footer";
import { Box, Container, Typography } from "@mui/material";
import Navbar from "@/components/navbar";

export default function Journals() {
  return (
    <>
      <Head>
        <title>MindMap - Journals</title>
        <meta
          name="description"
          content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>

      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Navbar />
        {/* Main Content */}
        <Container sx={{ flex: 1, py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Journal Page
          </Typography>
        </Container>

        {/* Footer Section */}
        <Box component="footer">
          <SupportFooter />
          <Footer />
        </Box>
      </Box>
    </>
  );
}
