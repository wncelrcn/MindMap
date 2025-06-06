import Image from "next/image";
import { Box, Typography, Grid } from "@mui/material";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function SupportFooter() {
  return (
    <Box
      component="footer"
      className={poppins.className}
      sx={{
        backgroundColor: "#f8f6ff",
        padding: { xs: "1.5rem", sm: "2rem", md: "4rem 8rem" },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "center", md: "flex-start" },
        gap: { xs: "2rem", sm: "3rem", md: "60px" },
        color: "#2f2361",
      }}
    >
      {/* Left Section */}
      <Box
        sx={{
          maxWidth: { xs: "100%", md: "25%" },
          textAlign: { xs: "center", md: "left" },
          marginRight: { md: "2rem", lg: "6rem" },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: "20px", sm: "24px" },
            fontWeight: 600,
            lineHeight: 1.4,
            mb: "8px",
            fontFamily: poppins.style.fontFamily,
          }}
        >
          Need Immediate Support?
          <br />
          You're Not Alone.
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "16px" },
            fontWeight: 600,
            fontFamily: poppins.style.fontFamily,
          }}
        >
          24/7 Hotline
        </Typography>
      </Box>

      {/* Right Section - Hotline Organizations */}
      <Grid
        container
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: "1rem", sm: "1.5rem", md: "2rem", lg: "6rem" },
          flex: 1,
          justifyContent: { xs: "center", sm: "center", md: "flex-end" },
          alignItems: "center",
          width: { xs: "100%", md: "auto" },
        }}
      >
        {/* Hopeline PH */}
        <Grid item xs={12} sm={6} md={4}>
          <Box
            textAlign="center"
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              width: "100%",
            }}
          >
            <Image
              src="/assets/hopeline.png"
              alt="Hopeline PH"
              width={50}
              height={50}
            />
            <Typography
              sx={{
                fontWeight: 600,
                mt: 1,
                mb: 0.5,
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "14px", sm: "16px" },
              }}
            >
              Hopeline PH
            </Typography>
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              (02) 8804-4673
            </Typography>
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              0917-558-4673
            </Typography>
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              0918-873-4673
            </Typography>
          </Box>
        </Grid>

        {/* DOH-NCMH */}
        <Grid item xs={12} sm={6} md={4}>
          <Box
            textAlign="center"
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              width: "100%",
            }}
          >
            <Image
              src="/assets/doh.png"
              alt="DOH-NCMH"
              width={50}
              height={50}
            />
            <Typography
              sx={{
                fontWeight: 600,
                mt: 1,
                mb: 0.5,
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "14px", sm: "16px" },
              }}
            >
              National Center for Mental
              <br />
              Health (DOH-NCMH)
            </Typography>
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              0919-057-1553
            </Typography>
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              0966-351-4518
            </Typography>
          </Box>
        </Grid>

        {/* In-Touch */}
        <Grid item xs={12} sm={6} md={4}>
          <Box
            textAlign="center"
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              width: "100%",
            }}
          >
            <Image
              src="/assets/intouch.png"
              alt="In-Touch"
              width={50}
              height={50}
            />
            <Typography
              sx={{
                fontWeight: 600,
                mt: 1,
                mb: 0.5,
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "14px", sm: "16px" },
              }}
            >
              In-Touch
            </Typography>
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              (02) 8893 7603
            </Typography>
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              0917-800-1123
            </Typography>
            <Typography
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              0919-056-0709
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
