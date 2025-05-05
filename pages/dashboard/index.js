import Head from "next/head";
import Footer from "@/components/footer";
import SupportFooter from "@/components/support_footer";
import { Box, Container } from "@mui/material";
import Navbar from "@/components/navbar";
import Dashboard from "@/components/dashboard";
import { requireAuth } from "@/lib/requireAuth";

export async function getServerSideProps(context) {
  return await requireAuth(context.req);
}

export default function DashboardPage({ user }) {
  return (
    <>
      <Head>
        <title>MindMap - Dashboard</title>
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
        <Box sx={{ flex: 1 }}>
          <Dashboard user={user} />
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