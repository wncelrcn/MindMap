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
} from "@mui/material";
import { Poppins, Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import { requireAuth } from "@/lib/requireAuth";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/navbar";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRouter } from "next/router";

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

export async function getServerSideProps(context) {
  return await requireAuth(context.req);
}

export default function ThemeCategories({ user }) {
  const router = useRouter();
  const { theme } = router.query; // Get the theme from the URL (e.g., "Journaling")
  const [categories, setCategories] = useState([]);
  const [themeData, setThemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!theme) return; // Wait for theme to be available

      try {
        // Fetch the theme and its categories from Supabase
        const { data, error } = await supabase
          .from("themes")
          .select(`
            id,
            name,
            categories (
              id,
              name,
              about,
              useful_when
            )
          `)
          .eq("name", theme)
          .single();

        if (error) throw error;
        setThemeData(data);
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [theme]);

  // Navigate to category page when a category is clicked
  const handleCategoryClick = (categoryName) => {
    router.push(`/guided-journaling/${theme}/${encodeURIComponent(categoryName)}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!themeData) return <div>Theme not found.</div>;

  return (
    <>
      <Head>
        <title>MindMap - {themeData.name} Categories</title>
        <meta
          name="description"
          content={`Explore categories under the ${themeData.name} theme for guided journaling.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Navbar />
        {/* Main Content */}
        <Box>
          <Link href="/guided-journaling" passHref>
            <Button
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "#2D1B6B",
                "&:hover": {
                  backgroundColor: "transparent",
                },
                minWidth: "auto",
                padding: { xs: "1rem", md: "1rem 8rem" },
              }}
            />
          </Link>
        </Box>
        <Container
          sx={{
            flex: 1,
            maxWidth: "lg",
            padding: { xs: "2rem", md: "1.5rem 8rem" },
          }}
        >
          <Box sx={{ maxWidth: { xs: "350px", md: "750px" }, mx: "auto", mb: 6 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="500"
              className={`${poppins.className}`}
              sx={{
                fontFamily: poppins.style.fontFamily,
                color: "#2D1B6B",
                fontSize: { xs: "2rem", md: "3rem" },
                textAlign: "center",
              }}
            >
              {themeData.name}
            </Typography>
          </Box>

          <Box sx={{ maxWidth: "1100px", mx: "auto" }}>
            <Grid container spacing={4} sx={{ justifyContent: "center" }}>
              {categories.map((category, index) => (
                <Grid
                  item
                  xs={12}
                  key={category.id}
                  sx={{ maxWidth: { xs: "360px", md: "850px" } }}
                >
                  <Card
                    onClick={() => handleCategoryClick(category.name)}
                    sx={{
                      borderRadius: 3,
                      border: "none",
                      backgroundColor: "#F9F8FE",
                      display: "flex",
                      padding: 0,
                      boxShadow: "none",
                      cursor: "pointer",
                      width: "100%",
                      minHeight: "100px",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "8px",
                        minHeight: "100%",
                        backgroundColor: "#4E2BBD",
                      }}
                    />
                    <CardContent 
                      sx={{ 
                        flex: 1, 
                        p: 0, 
                        padding: "1.8rem 2rem",
                        "&:last-child": { paddingBottom: "1.8rem" },
                      }}
                    >
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            className={`${poppins.className}`}
                            sx={{
                              fontFamily: poppins.style.fontFamily,
                              color: "#4E2BBD",
                              fontWeight: 600,
                              marginBottom: "0.3rem",
                            }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </Typography>
                          <Typography
                            variant="h5"
                            className={`${poppins.className}`}
                            sx={{
                              fontFamily: poppins.style.fontFamily,
                              color: "#2D1B6B",
                              fontWeight: 375,
                              fontSize: "2.65rem",
                            }}
                          >
                            {category.name}
                          </Typography>
                        </Box>
                        <ChevronRightIcon
                          sx={{ color: "#4E2BBD", fontSize: "2.2rem" }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>

        {/* Footer Section */}
        <Box component="footer" sx={{ mt: 10 }}>
          <SupportFooter />
          <Footer />
        </Box>
      </Box>
    </>
  );
}