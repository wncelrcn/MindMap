import { Box, Typography } from "@mui/material";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const JournalEntries = ({ stats }) => {
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "#5C35C2",
        borderRadius: 4,
        p: { xs: 1, sm: 1.5, md: 2 },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: { xs: "120px", sm: "auto" },
        maxWidth: { xs: "49%", sm: "none" },
        color: "white",
        flexDirection: "column",
        backgroundImage: "url('/assets/profile/entries-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: poppins.style.fontFamily,
            fontWeight: 600,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            textAlign: "center",
          }}
        >
          Journal Entries
        </Typography>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: poppins.style.fontFamily,
              fontWeight: 700,
              fontSize: {
                xs: "3rem",
                sm: "4rem",
                md: "5rem",
                lg: "6rem",
              },
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            {stats?.total_entries || 0}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default JournalEntries;
