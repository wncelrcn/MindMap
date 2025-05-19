import Head from "next/head";
import Footer from "@/components/footer";
import SupportFooter from "@/components/support_footer";
import { Box, Typography, Container, Button } from "@mui/material";
import { Poppins, Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import { requireAuth } from "@/lib/requireAuth";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/navbar";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

export default function CategoryDetails({ user }) {
  const router = useRouter();
  const { theme, category } = router.query; // Get theme and category from URL
  const [themeData, setThemeData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!theme || !category) return;

      try {
        // Fetch the theme and the specific category from Supabase
        const { data, error } = await supabase
          .from("themes")
          .select(
            `
            id,
            name,
            categories (
              id,
              name,
              about,
              useful_when
            )
          `
          )
          .eq("name", theme)
          .eq("categories.name", category)
          .single();

        if (error) throw error;
        setThemeData(data);
        const selectedCategory = data.categories.find(
          (cat) => cat.name === category
        );
        setCategoryData(selectedCategory || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [theme, category]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!themeData || !categoryData) return <div>Category not found.</div>;

  return (
    <>
      <Head>
        <title>
          MindMap - {themeData.name} - {categoryData.name}
        </title>
        <meta
          name="description"
          content={`Explore the ${categoryData.name} category under the ${themeData.name} theme for guided journaling.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Navbar />
        {/* Back Arrow */}
        <Box>
          <Link href={`/guided-journaling/${theme}`} passHref>
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

        {/* Main Content Container */}
        <Container
          maxWidth={false}
          sx={{
            width: "80%",
            mx: "auto",
            pl: { xs: 4, md: 8, lg: 12 },
            pr: { xs: 4, md: 8, lg: 12 },
          }}
        >
          {/* Gradient Header */}
          <Box
            sx={{
              background:
                "linear-gradient(90deg, #e8bdde 0%, #ded3f3 50%, #bfa4e0 100%)",
              borderRadius: "16px",
              maxWidth: "100%",
              width: "100%",
              mb: 4,
              p: { xs: 3, md: 4 },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="500"
              className={`${poppins.className}`}
              sx={{
                fontFamily: poppins.style.fontFamily,
                color: "#2D1B6B",
                fontSize: { xs: "1rem", md: "1.1rem" },
                mb: 2,
              }}
            >
              {themeData.name}
            </Typography>

            <Typography
              variant="h2"
              component="h1"
              fontWeight="500"
              className={`${poppins.className}`}
              sx={{
                fontFamily: poppins.style.fontFamily,
                color: "#2D1B6B",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                mb: 2,
              }}
            >
              {categoryData.name}
            </Typography>

            <Typography
              variant="body1"
              className={`${quicksand.className}`}
              sx={{
                fontFamily: quicksand.style.fontFamily,
                color: "#2D1B6B",
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 400,
              }}
            >
              A simple {themeData.name.toLowerCase()} practice with four guiding
              prompts.
            </Typography>
          </Box>

          {/* Start Writing Button Box */}
          <Button
            component={Box}
            onClick={() =>
              router.push(
                `/guided-journaling/${theme}/${encodeURIComponent(
                  category
                )}/questions`
              )
            }
            sx={{
              backgroundColor: "#F9F8FE",
              borderRadius: "8px",
              maxWidth: "100%",
              width: "100%",
              mb: 6,
              p: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textTransform: "none",
              fontFamily: poppins.style.fontFamily,
              fontWeight: 500,
              fontSize: "1.1rem",
              color: "#4E2BBD",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#F0EEFF",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            Start Writing
          </Button>

          {/* Content Section */}
          <Box sx={{ maxWidth: "100%", width: "100%" }}>
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h5"
                component="h3"
                fontWeight="600"
                className={`${poppins.className}`}
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  color: "#2D1B6B",
                  fontSize: { xs: "1.5rem", md: "1.8rem" },
                  mb: 2,
                }}
              >
                About
              </Typography>
              <Typography
                variant="body1"
                className={`${quicksand.className}`}
                sx={{
                  fontFamily: quicksand.style.fontFamily,
                  color: "#2D1B6B",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontWeight: 400,
                  mb: 1,
                  lineHeight: 1.6,
                }}
              >
                {categoryData.about}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="h5"
                component="h3"
                fontWeight="600"
                className={`${poppins.className}`}
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  color: "#2D1B6B",
                  fontSize: { xs: "1.5rem", md: "1.8rem" },
                  mb: 2,
                }}
              >
                Useful When
              </Typography>
              <Box
                component="ul"
                sx={{
                  listStyleType: "disc",
                  pl: 4,
                  "& li": {
                    pb: 1,
                  },
                }}
              >
                {categoryData.useful_when.split("\n").map((point, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body1"
                    className={`${quicksand.className}`}
                    sx={{
                      fontFamily: quicksand.style.fontFamily,
                      color: "#2D1B6B",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    {point.trim()}
                  </Typography>
                ))}
              </Box>
            </Box>
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
