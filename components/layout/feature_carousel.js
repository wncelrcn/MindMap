import { Box, Typography } from "@mui/material";

export default function FeatureCarousel({ features }) {
  const displayFeatures = features;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 4,
          py: 4,
          width: "100%",
          pr: 2,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {displayFeatures.map((feature) => (
          <Box
            key={feature.id}
            sx={{
              minWidth: 380,
              maxWidth: 380,
              flexShrink: 0,
              textAlign: "left",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                mb: 2,
              }}
            >
              <Box
                component="img"
                src={feature.image}
                alt={`${feature.title} Illustration`}
                sx={{
                  width: 250,
                  height: 150,
                  objectFit: "contain",
                  objectPosition: "left",
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: "#E5E0FA",
                px: 2,
                py: 1,
                mb: 3,
                fontWeight: 600,
                textAlign: "left",
                fontSize: "1.30rem",
              }}
            >
              {feature.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ textAlign: "left", fontSize: "1.25rem" }}
            >
              {feature.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
