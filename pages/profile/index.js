import Head from "next/head";
import Image from "next/image";
import Footer from "@/components/footer";
import SupportFooter from "@/components/support_footer";
import Navbar from "@/components/navbar";
import {
  Box,
  Typography,
  Container,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import { useEffect, useState } from "react";
import { requireAuth } from "@/lib/requireAuth";
import { supabase } from "@/lib/supabase";
import FavoriteIcon from '@mui/icons-material/Favorite';
import SpaIcon from '@mui/icons-material/Spa';
import WorkIcon from '@mui/icons-material/Work';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import EditIcon from '@mui/icons-material/Edit';

// Font configurations
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
  return await requireAuth(context.req);
}

export default function Profile({ user }) {
  const [username, setUsername] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      <Head>
        <title>MindMap - Profile</title>
        <meta
          name="description"
          content="Elevate your mental wellness, mindset, and cognitive strength with the next level of journaling."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/logo.png" />
      </Head>
      <Box 
        display="flex" 
        flexDirection="column" 
        minHeight="100vh"
        sx={{ backgroundColor: '#f8f9fa' }} 
      >
        <Navbar />

        <Container 
          maxWidth="lg" 
          sx={{ 
            flexGrow: 1, 
            py: 5,
            px: { xs: 1, md: 1 }, 
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: { xs: 6, md: 10 },
              maxWidth: '1300px',
              mx: 'auto' 
            }}
          >
            {/* Left Section - Profile Information */}
            <Box 
              sx={{ 
                flex: '0 0 auto', 
                maxWidth: { xs: '100%', md: '42%' }, 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Edit Profile Button */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f7',
                  borderRadius: 2,
                  p: 1,
                  color: '#5C35C2',
                  cursor: 'pointer',
                  zIndex: 2
                }}
              >
                <Typography sx={{ mr: 1, fontSize: '0.5rem', fontFamily: poppins.style.fontFamily }}>
                  Edit Profile
                </Typography>
                <EditIcon fontSize="xs" />
              </Box>

              {/* Profile Picture */}
              <Box 
                sx={{ 
                  position: 'relative', 
                  width: 220,
                  height: 220,
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  backgroundColor: '#f5f5f7',
                  mb: 3,
                  mx: 'auto'
                }}
              >
                <Image
                  src="/assets/group 47804.png"
                  alt="Profile Picture"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>

              {/* Name with Gradient */}
              <Typography
                variant="h2" 
                component="h1"
                align="center"
                sx={{
                  fontFamily: raleway.style.fontFamily,
                  fontWeight: 700,
                  fontSize: { xs: '3rem', md: '4rem' },
                  mb: 3,
                  background: 'linear-gradient(90deg, #5C35C2 0%, #ED6D6C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {username}
              </Typography>

              {/* About Me Section */}
              <Box sx={{ mb: 4, textAlign: 'center', px: 2 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: raleway.style.fontFamily,
                    color: '#555',
                    mb: 2,
                    textAlign: 'center',
                    fontSize: '1.75rem'
                  }}
                >
                  About Me
                </Typography>
                <Typography
                  sx={{
                    fontFamily: quicksand.style.fontFamily,
                    color: '#555',
                    lineHeight: 1.6,
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  I'm passionate about personal growth, mental well-being, and creative thinking. I love finding ways to simplify complex ideas and gain clarity in my thoughts. Whether it's through journaling, basketball, or problem-solving, I believe in the power of organization to improve mindset and productivity.
                </Typography>
              </Box>
            </Box>

            {/* Right Section - Insights and Badges */}
            <Box sx={{ flex: 1 }}>
              {/* Insights Section */}
              <Typography
                variant="h5"
                sx={{
                  fontFamily: raleway.style.fontFamily,
                  fontWeight: 'bold',
                  color: '#5C35C2',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                Insights
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 5 }}>
                {/* Personality Card */}
                <Box 
                  sx={{ 
                    flex: '0 0 auto',
                    width: { xs: '100%', sm: '40%' },
                    backgroundColor: isFlipped ? '#5C35C2' : '#f5f5f7',
                    borderRadius: 4,
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    perspective: '1000px',
                    transition: 'transform 0.6s, background-color 0.6s',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                  }}
                >
                  {!isFlipped ? (
                    <>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: '#5C35C2',
                          mb: 2,
                          fontSize: '1rem'
                        }}
                      >
                        Personality
                      </Typography>

                      <Box sx={{ mb: 'auto' }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: '#4527A0',
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: '1.75rem'
                          }}
                        >
                          The
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: '#4527A0',
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: '1.75rem'
                          }}
                        >
                          Resilient
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: '#4527A0',
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: '1.75rem'
                          }}
                        >
                          Quick-
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: '#4527A0',
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: '1.75rem'
                          }}
                        >
                          Thinking
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: '#4527A0',
                            fontWeight: 700,
                            fontSize: '1.75rem'
                          }}
                        >
                          Maverick
                        </Typography>
                      </Box>
                      
                      {/* Purple zigzag icon */}
                      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                        <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M30 10L20 20L30 30L20 40" stroke="#5C35C2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: 'white',
                          mb: 2,
                          fontSize: '1rem'
                        }}
                      >
                        Personality
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: 'white',
                          lineHeight: 1.6,
                          fontSize: '1.05rem'
                        }}
                      >
                        You are a bold, independent thinker who thrives under pressure, quickly adapts to challenges, and fearlessly carves their own path, unafraid to challenge norms and take risks to achieve their vision.
                      </Typography>
                    </>
                  )}
                  
                  {/* Flip Icon */}
                  <IconButton 
                    onClick={handleFlip}
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      color: isFlipped ? 'white' : '#5C35C2',
                      padding: '4px'
                    }}
                  >
                    <FlipCameraAndroidIcon fontSize="medium" />
                  </IconButton>
                </Box>

                {/* Recurring Journal Topics, Mascot, and Discover More */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Recurring Journal Topics */}
                  <Box 
                    sx={{ 
                      backgroundColor: '#5C35C2',
                      borderRadius: 4,
                      p: 2.5,
                      color: 'white'
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: poppins.style.fontFamily,
                        mb: 2,
                        fontSize: '1.2rem'
                      }}
                    >
                      Recurring Journal Topics
                    </Typography>

                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FavoriteIcon sx={{ mr: 1, fontSize: '1.4rem' }} />
                        <Typography
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            fontSize: '1rem'
                          }}
                        >
                          Interpersonal Relationship
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SpaIcon sx={{ mr: 1, fontSize: '1.4rem' }} />
                        <Typography
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            fontSize: '1rem'
                          }}
                        >
                          Personal Well-being and Emotional State
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ mr: 1, fontSize: '1.4rem' }} />
                        <Typography
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            fontSize: '1rem'
                          }}
                        >
                          Work Life Balance
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Mascot and Discover More */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, flex: 1 }}>
                    {/* Mascot Card */}
                    <Box 
                      sx={{ 
                        flex: 1, 
                        backgroundColor: '#f5f5f7',
                        borderRadius: 4,
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        aspectRatio: '1/1'
                      }}
                    >
                      <Box sx={{ width: 120, height: 120, position: 'relative' }}>
                        <Image
                          src="/assets/image 50.png"
                          alt="Mascot"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </Box>
                    </Box>

                    {/* Discover More Card */}
                    <Box 
                      sx={{ 
                        flex: 1,
                        backgroundColor: '#5C35C2',
                        borderRadius: 4,
                        p: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: 'white',
                        aspectRatio: '1/1'
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          fontWeight: 700,
                          textAlign: 'right', 
                          mb: 3,
                          fontSize: '1.5rem'
                        }}
                      >
                        Discover More
                      </Typography>

                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#FBF7C0',
                          color: '#555',
                          fontFamily: poppins.style.fontFamily,
                          borderRadius: 5,
                          px: 2.5,
                          py: 0.5,
                          fontSize: '0.5rem',
                          '&:hover': {
                            backgroundColor: '#F0EDB0',
                          }
                        }}
                      >
                        Read here
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Badges Section */}
              <Typography
                variant="h5"
                sx={{
                  fontFamily: raleway.style.fontFamily,
                  color: '#5C35C2',
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                Badges
              </Typography>

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }, 
                gap: 3,
                '& img': { maxWidth: '100%' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 100,
                      height: 100,
                      mr: 2,
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <Image
                      src="/assets/Group 47668.png"
                      alt="Mindfulness Badge"
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: poppins.style.fontFamily,
                        color: '#5C35C2',
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}
                    >
                      John's Mindfulness Practice
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: quicksand.style.fontFamily,
                        color: '#777',
                        fontSize: '0.9rem'
                      }}
                    >
                      January
                    </Typography>
                  </Box>
                </Box>

                {/* Badge 2 - Journal Master */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 100,
                      height: 100,
                      mr: 2,
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <Image
                      src="/assets/Group 47669.png"
                      alt="Journal Master Badge"
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: poppins.style.fontFamily,
                        color: '#5C35C2',
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}
                    >
                      Journal Master
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: quicksand.style.fontFamily,
                        color: '#777',
                        fontSize: '0.9rem'
                      }}
                    >
                      January
                    </Typography>
                  </Box>
                </Box>

                {/* Badge 3-6 - Unlocked Badge Placeholders */}
                {[...Array(4)].map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 100,
                        height: 100,
                        mr: 2,
                        position: 'relative',
                        flexShrink: 0
                      }}
                    >
                      <Image
                        src="/assets/Group 47671.png"
                        alt="Unlocked Badge"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: '#5C35C2',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        Complete your Goals to Unlock the Badge
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
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