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
import { Raleway, Poppins } from "next/font/google";
import { useRouter } from "next/router";

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

export default function RecapCard({ recap, count }) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to view recap page with recap data
    router.push({
      pathname: "/view-recap",
      query: {
        recapId: `${recap.date_range_start}_${recap.date_range_end}`,
        dateStart: recap.date_range_start,
        dateEnd: recap.date_range_end,
      },
    });
  };

  // Format date range for display
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startMonth = start
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const endMonth = end
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();

    const startDay = start.getDate();
    const endDay = end.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
  };

  return (
    <Grid container spacing={4} justifyContent="center">
      <Button
        onClick={handleClick}
        sx={{
          p: 0,
          width: "100%",
          minWidth: "16.5rem",
          maxWidth: "16.5rem",
          height: "100%",
          display: "block",
          textAlign: "left",
          borderRadius: 4,
          textTransform: "none",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        <Card
          elevation={0}
          sx={{
            background:
              "linear-gradient(135deg, #ccc9fd 0%, #F9F8FE 50%, #dec1e7 100%)",
            borderRadius: 4,
            height: "100%",
            minHeight: "180px",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease",
            border: "2px solid #C4B3E6",
            position: "relative",
            padding: 3,
          }}
        >
          {/* Count and Date in top right */}
          <Box
            sx={{
              position: "absolute",
              top: 24,
              right: 24,
              textAlign: "right",
            }}
          >
            <Typography
              sx={{
                fontSize: "3rem",
                fontWeight: 600,
                color: "#2D1B6B",
                fontFamily: poppins.style.fontFamily,
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {count}
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 400,
                color: "#5A4B7A",
                fontFamily: poppins.style.fontFamily,
                letterSpacing: "0.1em",
              }}
            >
              {formatDateRange(recap.date_range_start, recap.date_range_end)}
            </Typography>
          </Box>

          {/* Growth Icon */}
          <Box
            sx={{
              mt: 6,
              mb: 2,
              display: "flex",
            }}
          >
            <Box
              component="img"
              src="/assets/recap/growth-icon.png"
              alt="Growth icon"
              sx={{
                width: "80px",
                height: "80px",
                filter: "drop-shadow(0 4px 8px rgba(45, 27, 107, 0.2))",
              }}
            />
          </Box>

          {/* Title */}
          <Box
            sx={{
              mt: "auto",
            }}
          >
            <Typography
              fontWeight={500}
              color="#2D1B6B"
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontSize: "1.5rem",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {formatDateRange(recap.date_range_start, recap.date_range_end)}{" "}
              Recap
            </Typography>
          </Box>
        </Card>
      </Button>
    </Grid>
  );
}
