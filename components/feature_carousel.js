import { Box, Typography } from "@mui/material";

export default function FeatureCarousel({ features }) {
  // If no features are provided, use these default features
  const defaultFeatures = [
    {
      id: 1,
      title: "Smart Automation",
      description:
        "Automate repetitive tasks and workflows to save time and reduce manual effort.",
      image: "/assets/feature_automation.png",
    },
    {
      id: 2,
      title: "Data Analytics",
      description:
        "Gain valuable insights with powerful analytics tools that visualize your data.",
      image: "/assets/feature_analytics.png",
    },
    {
      id: 3,
      title: "Cloud Storage",
      description:
        "Access your files from anywhere with secure and reliable cloud storage solutions.",
      image: "/assets/feature_storage.png",
    },
    {
      id: 4,
      title: "24/7 Support",
      description:
        "Get help whenever you need it with our round-the-clock customer support team.",
      image: "/assets/feature_support.png",
    },
  ];

  // Use provided features or default ones
  const displayFeatures = features || defaultFeatures;

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
