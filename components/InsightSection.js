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
    <Box sx={{ mb: 12 }}>
      <Typography
        sx={{
          fontSize: "2rem",
          fontWeight: 500,
          color: "#2D1B6B",
          fontFamily: poppins.style.fontFamily,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: "1.2rem",
          fontWeight: 400,
          color: "#2D1B6B",
          fontFamily: poppins.style.fontFamily,
        }}
      >
        {subtitle}
      </Typography>
      <Box
        sx={{
          mt: 2,
          mb: 2,
          border: "1px solid black",
          borderRadius: "10px",
          padding: "2rem",
          backgroundColor: "rgba(213, 212, 244, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: 3,
          height: "180px",
          overflow: "hidden",
        }}
      >
        {imagePosition === "left" && (
          <Image
            src={imageSrc}
            width={180}
            height={180}
            style={{ marginTop: "20px" }}
            alt="Person illustration"
          />
        )}
        <Typography
          sx={{
            fontSize: "1.4rem",
            fontWeight: 300,
            color: "#2D1B6B",
            textAlign: imagePosition === "left" ? "right" : "left",
            flex: 1,
            fontFamily: poppins.style.fontFamily,
          }}
        >
          {mainText}
        </Typography>
        {imagePosition === "right" && (
          <Image
            src={imageSrc}
            width={180}
            height={180}
            style={{ marginTop: "20px" }}
            alt="Person illustration"
          />
        )}
      </Box>
      {additionalContent.map((content, index) => (
        <Box key={index} sx={{ mt: 3, mb: 3 }}>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 400,
              color: "#2D1B6B",
              mb: 1,
              backgroundColor: "rgba(213, 212, 244, 0.3)",
              fontFamily: poppins.style.fontFamily,
            }}
          >
            {content.title}
          </Typography>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 300,
              color: "#2D1B6B",
              fontFamily: poppins.style.fontFamily,
            }}
          >
            {content.description}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
