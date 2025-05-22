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
import Navbar from "@/components/navbar";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRouter } from "next/router";
import { createClient } from "@/utils/supabase/server-props";

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

export default function ThemeCategories({ user }) {
  const router = useRouter();
  const { theme } = router.query;
  const [categories, setCategories] = useState([]);
  const [themeData, setThemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!theme) return;

      try {
        const response = await fetch(
          `/api/create-journal/theme?theme=${theme}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch theme data");
        }
        const data = await response.json();
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
    router.push(
      `/guided-journaling/${theme}/${encodeURIComponent(categoryName)}`
    );
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
          <Box sx={{ maxWidth: { xs: "350px", md: "750px" }, mb: 6, mx: 2 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="500"
              className={`${poppins.className}`}
              sx={{
                fontFamily: poppins.style.fontFamily,
                color: "#2D1B6B",
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              {themeData.name}
            </Typography>
          </Box>

          <Box
            sx={{
              maxWidth: "900px",
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {categories.map((category, index) => (
              <Box
                key={category.id}
                sx={{ display: "flex", alignItems: "stretch" }}
              >
                <Box
                  sx={{
                    width: "5px",
                    background: "#4E2BBD",
                    minHeight: "100px",
                    alignSelf: "stretch",
                    mr: "1.5rem",
                  }}
                />
                <Card
                  onClick={() => handleCategoryClick(category.name)}
                  sx={{
                    borderRadius: "0 24px 24px 0",
                    border: "none",
                    backgroundColor: "#F9F8FE",
                    display: "flex",
                    alignItems: "center",
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
                  <CardContent
                    sx={{
                      flex: 1,
                      p: 0,
                      padding: "1.8rem 2rem",
                      "&:last-child": { paddingBottom: "1.8rem" },
                      display: "flex",
                      alignItems: "center",
                      minHeight: "100px",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        className={`${poppins.className}`}
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: "#4E2BBD",
                          fontWeight: 600,
                          marginBottom: "0.3rem",
                          textAlign: "left",
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
                          textAlign: "left",
                        }}
                      >
                        {category.name}
                      </Typography>
                    </Box>
                    <ChevronRightIcon
                      sx={{ color: "#4E2BBD", fontSize: "2.2rem", ml: 2 }}
                    />
                  </CardContent>
                </Card>
              </Box>
            ))}
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
