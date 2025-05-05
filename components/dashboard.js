import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  useMediaQuery,
  useTheme
} from "@mui/material";
import { supabase } from "@/lib/supabase";
import { Raleway, Poppins, Quicksand } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-poppins",
  });

const Dashboard = ({ user }) => {
  const [username, setUsername] = useState("User");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  useEffect(() => {
    // Fetch username from Supabase when component mounts
    const fetchUsername = async () => {
      if (user && user.email) {
        try {
          const { data, error } = await supabase
            .from("user_table")
            .select("username")
            .eq("email", user.email)
            .single();
            
          if (error) {
            console.error("Error fetching username:", error);
          } else if (data) {
            setUsername(data.username);
          }
        } catch (error) {
          console.error("Failed to fetch username:", error);
        }
      }
    };
    
    fetchUsername();
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Gradient Text */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography 
          variant="h3" 
          component="h1" 
          fontWeight="700"
          className={`${poppins.className}`}
          sx={{ 
            color: "#2D1B6B",
            "& span": {
              background: "linear-gradient(90deg, #2D1B6B 0%, #ED6D6C 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }
          }}
        >
          <span>Hello, {username}!</span>
        </Typography>
        
        <Button 
          variant="outlined" 
          sx={{ 
            borderRadius: '9999px',
            borderColor: '#2D1B6B',
            color: '#2D1B6B',
            fontWeight: 500,
            px: 3,
            "&:hover": {
              borderColor: '#5A33B7',
              backgroundColor: 'rgba(90, 51, 183, 0.04)'
            }
          }}
        >
          See your Weekly Recap
        </Button>
      </Box>
      
      {/* Hero Section */}
      <Card 
        elevation={0}
        sx={{ 
          bgcolor: "#f8f7fc", 
          borderRadius: 4,
          mb: 6,
          overflow: "visible"
        }}
      >
        <Grid container spacing={0}>
          {/* Create Entry Button */}
          <Grid item xs={12} sm={4} md={3}>
            <Box 
              sx={{ 
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                m: 2,
                p: 2,
                height: isMobile ? "auto" : "90%"
              }}
            >
              <Button
                sx={{
                  backgroundColor: "white",
                  borderRadius: 4,
                  boxShadow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 3,
                  width: "100%",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  '&:hover': {
                    backgroundColor: "white",
                    boxShadow: 3,
                    transform: "translateY(-5px)"
                  }
                }}
              >
                <Box 
                  component="img" 
                  src="/assets/folder-icon.png" 
                  alt="Folder icon"
                  sx={{ width: "100px", height: "90px", mb: 2 }}
                />
                <Typography 
                  variant="body1"
                  fontWeight={600}
                  color="#2D1B6B"
                  className={`${poppins.className}`}
                >
                  Create an Entry
                </Typography>
              </Button>
            </Box>
          </Grid>
          
          {/* Main Banner */}
          <Grid item xs={12} sm={8} md={9}>
            <Box 
              sx={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center", 
                p: { xs: 2, md: 4 },
                height: "100%"
              }}
            >
              {/* Person Image */}
              <Box 
                sx={{ 
                  flex: "0 0 auto",
                  mr: { xs: 0, md: 4 },
                  mb: { xs: 2, md: 0 },
                  width: { xs: "70%", sm: "40%", md: "30%" },
                  maxWidth: "250px"
                }}
              >
                <Box 
                  component="img" 
                  src="/assets/person-laptop.png" 
                  alt="Person using laptop"
                  sx={{ width: "100%", height: "auto" }}
                />
              </Box>
              
              {/* Text Content */}
              <Box>
                <Typography 
                  variant="subtitle1"
                  color="#5A33B7"
                  fontWeight={500}
                  className={`${poppins.className}`}
                  gutterBottom
                  sx={{ fontStyle: "italic" }}
                >
                  MindMap
                </Typography>
                <Typography 
                  variant="h4"
                  component="h2"
                  fontWeight={700}
                  color="#2D1B6B"
                  className={`${poppins.className}`}
                  gutterBottom
                  sx={{ lineHeight: 1.2 }}
                >
                  Your daily check-in,<br />
                  reimagined.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    mt: 2,
                    bgcolor: "#5A33B7",
                    borderRadius: "9999px",
                    fontWeight: 600,
                    px: 3,
                    "&:hover": {
                      bgcolor: "#4a2ba0"
                    }
                  }}
                >
                  Take a Quiz
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>
      
      {/* Recent Journals Section */}
      <Box mb={4}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            fontWeight={700}
            color="#2D1B6B"
            className={`${poppins.className}`}
          >
            Recent Journals
          </Typography>
          <Typography 
            component="a"
            href="#"
            sx={{ 
              color: "#5A33B7", 
              textDecoration: "none",
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline"
              }
            }}
            className={`${poppins.className}`}
          >
            See All
          </Typography>
        </Box>
        
        {/* Journal Cards */}
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Button
                sx={{
                  p: 0,
                  width: "100%",
                  height: "100%",
                  display: "block",
                  textAlign: "left",
                  borderRadius: 4,
                  textTransform: "none",
                  transition: "transform 0.3s ease",
                  '&:hover': {
                    transform: "translateY(-5px)",
                  }
                }}
              >
                <Card 
                  elevation={0}
                  sx={{ 
                    background: 'linear-gradient(135deg, #ccc9fd 0%, #F9F8FE 50%, #dec1e7 100%)',
                    borderRadius: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    border: '2px solid #cec0f2'
                  }}
                >
                  {/* Free Journaling as a header in a box */}
                  <Box
                    sx={{
                      backgroundColor: '#f9f8fe', 
                      borderBottom: '1px solid #cec2f3', 
                      borderRadius: '4px 4px 0 0', 
                      padding: '8px 16px',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      component="span"
                      sx={{ 
                        color: "#2D1B6B",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                      className={`${poppins.className}`}
                    >
                      <Box 
                        component="img" 
                        src="/assets/leaf-icon.png"
                        alt="Leaf icon"
                        sx={{ 
                          width: "18px", 
                          height: "18px",
                        }}
                      />
                      Free Journaling
                    </Typography>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="body2" 
                      color="#2D1B6B"
                      mb={1}
                      className={`${poppins.className}`}
                    >
                      Journal Created:
                    </Typography>
                    
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      fontWeight={600}
                      color="#2D1B6B"
                      className={`${poppins.className}`}
                      sx={{ mb: 4 }}
                    >
                      Growth in Challenges
                    </Typography>
                    
                    <Box sx={{ borderTop: "1px solid #CEC2F3", pt: 2, mt: "auto" }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color="#2D1B6B"
                        className={`${poppins.className}`}
                      >
                        Friday, 18 Feb
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="#2D1B6B"
                        className={`${poppins.className}`}
                      >
                        09:15
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;