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

export default function RecentJournal({
  title,
  content,
  date,
  time,
  journalID,
  journalType,
}) {
  const router = useRouter();

  const handleClick = () => {
    sessionStorage.setItem("currentJournalId", journalID);
    sessionStorage.setItem("currentJournalType", journalType);
    router.replace("/view-journal");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease",
            border: "2px solid #cec0f2",
          }}
        >
          {/* Free Journaling as a header in a box */}
          <Box
            sx={{
              backgroundColor: "#f9f8fe",
              borderBottom: "1px solid #cec2f3",
              borderRadius: "4px 4px 0 0",
              padding: "8px 16px",
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
                fontFamily: poppins.style.fontFamily,
              }}
              className={`${poppins.className}`}
            >
              <Box
                component="img"
                src={
                  journalType === "freeform"
                    ? "/assets/leaf-icon.png"
                    : "/assets/book-icon.png"
                }
                alt="Leaf icon"
                sx={{
                  width: "18px",
                  height: "18px",
                }}
              />
              {journalType === "freeform"
                ? "Free Journaling"
                : "Guided Journaling"}
            </Typography>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              color="#2D1B6B"
              mb={1}
              sx={{
                fontFamily: poppins.style.fontFamily,
                fontWeight: 300,
              }}
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
              sx={{
                mb: 4,
                fontFamily: raleway.style.fontFamily,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </Typography>

            <Box
              sx={{
                borderTop: "1px solid #CEC2F3",
                pt: 2,
                mt: "auto",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color="#2D1B6B"
                sx={{ fontFamily: poppins.style.fontFamily }}
                className={`${poppins.className}`}
              >
                {formatDate(date)}
              </Typography>
              <Typography
                variant="body2"
                color="#2D1B6B"
                className={`${poppins.className}`}
                sx={{
                  fontFamily: poppins.style.fontFamily,
                  fontWeight: 300,
                }}
              >
                {formatTime(time)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Button>
    </Grid>
  );
}
