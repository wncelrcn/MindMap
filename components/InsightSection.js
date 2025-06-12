import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function InsightSection({
  title,
  subtitle,
  imageSrc,
  mainText,
  imagePosition = "left",
  additionalContent = [],
}) {
  return (
    <Box sx={{ mb: { xs: 6, sm: 8, md: 10, lg: 12 } }}>
      <Typography
        sx={{
          fontSize: { xs: "1.4rem", sm: "1.6rem", md: "2rem" },
          fontWeight: 500,
          color: "#2D1B6B",
          fontFamily: poppins.style.fontFamily,
          mb: { xs: 0.5, sm: 0.8, md: 1 },
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
          fontWeight: 400,
          color: "#2D1B6B",
          fontFamily: poppins.style.fontFamily,
          mb: { xs: 1.5, sm: 2, md: 2 },
        }}
      >
        {subtitle}
      </Typography>
      <Box
        sx={{
          mt: { xs: 1.5, sm: 2, md: 2 },
          mb: { xs: 1.5, sm: 2, md: 2 },
          border: "1px solid black",
          borderRadius: { xs: "8px", sm: "10px" },
          padding: { xs: "1rem", sm: "1.5rem", md: "2rem" },
          backgroundColor: "rgba(213, 212, 244, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2, md: 3 },
          height: { xs: "auto", sm: "160px", md: "180px" },
          minHeight: { xs: "120px", sm: "160px" },
          overflow: "hidden",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {imagePosition === "left" && (
          <Box
            sx={{
              order: { xs: 1, sm: 1 },
              flexShrink: 0,
            }}
          >
            <Image
              src={imageSrc}
              width={180}
              height={180}
              style={{ marginTop: "20px" }}
              alt="Person illustration"
            />
          </Box>
        )}
        <Typography
          sx={{
            fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.4rem" },
            fontWeight: 300,
            color: "#2D1B6B",
            textAlign: { 
              xs: "center", 
              sm: imagePosition === "left" ? "right" : "left",
              md: imagePosition === "left" ? "right" : "left"
            },
            flex: 1,
            fontFamily: poppins.style.fontFamily,
            lineHeight: { xs: "1.4", sm: "1.5" },
            order: { xs: 2, sm: imagePosition === "left" ? 2 : 1 },
          }}
        >
          {mainText}
        </Typography>
        {imagePosition === "right" && (
          <Box
            sx={{
              order: { xs: 1, sm: 2 },
              flexShrink: 0,
            }}
          >
            <Image
              src={imageSrc}
              width={180}
              height={180}
              style={{ marginTop: "20px" }}
              alt="Person illustration"
            />
          </Box>
        )}
      </Box>
      {additionalContent.map((content, index) => (
        <Box key={index} sx={{ mt: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "20px" },
              fontWeight: 400,
              color: "#2D1B6B",
              mb: { xs: 0.5, sm: 0.8, md: 1 },
              backgroundColor: "rgba(213, 212, 244, 0.3)",
              fontFamily: poppins.style.fontFamily,
              padding: { xs: "0.5rem", sm: "0.6rem", md: "0.8rem" },
              borderRadius: { xs: "4px", sm: "6px" },
            }}
          >
            {content.title}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem", md: "20px" },
              fontWeight: 300,
              color: "#2D1B6B",
              fontFamily: poppins.style.fontFamily,
              lineHeight: { xs: "1.5", sm: "1.6" },
              padding: { xs: "0.5rem 0", sm: "0.6rem 0" },
            }}
          >
            {content.description}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}