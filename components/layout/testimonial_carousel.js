import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  IconButton,
} from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

export default function TestimonialCarousel({ testimonials }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const displayTestimonials = testimonials;
  const totalTestimonials = displayTestimonials.length;

  // Navigate to the next or previous testimonial
  const navigate = (direction) => {
    if (direction === "next") {
      setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
    } else {
      setCurrentIndex(
        (prev) => (prev - 1 + totalTestimonials) % totalTestimonials
      );
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalTestimonials);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalTestimonials]);

  // Scroll to the current testimonial when index changes
  useEffect(() => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const testimonialCard = container.children[currentIndex];

      if (testimonialCard) {
        const containerWidth = container.offsetWidth;
        const cardWidth = testimonialCard.offsetWidth;
        const scrollLeft =
          testimonialCard.offsetLeft - (containerWidth - cardWidth) / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  return (
    <Box sx={{ position: "relative", width: "100%", my: { xs: 2, md: 4 } }}>
      <Box
        ref={carouselRef}
        sx={{
          display: "flex",
          overflowX: "hidden",
          scrollBehavior: "smooth",
          width: "100%",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          // Add some padding on mobile to prevent edge clipping
          px: { xs: 1, sm: 2 },
        }}
      >
        {displayTestimonials.map((testimonial, index) => (
          <Card
            key={testimonial.id}
            sx={{
              display: "flex",
              minWidth: { xs: "85%", sm: "75%", md: "70%" },
              maxWidth: { xs: 350, sm: 400, md: 450 },
              flexShrink: 0,
              flexDirection: { xs: "column", md: "row" },
              borderRadius: { xs: 3, md: 4 },
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
              height: { xs: "auto", md: 400 },
              margin: { xs: "0 8px", sm: "0 20px", md: "0 50px" },
              // Improved responsive design
              minHeight: { xs: 380, sm: 420, md: 400 },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                aspectRatio: { xs: "1.1/1", md: "auto" },
                height: { xs: "auto", md: "100%" },
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                image={testimonial.image}
                alt={`${testimonial.name} testimonial`}
              />
            </Box>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: { xs: 3, sm: 3.5, md: 4 },
                width: { xs: "100%", md: "50%" },
                position: "relative",
                minHeight: { xs: 200, md: "auto" },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: 12, md: 20 },
                  left: { xs: 12, md: 20 },
                  color: "#673AB7",
                  opacity: 0.8,
                }}
              >
                <FormatQuoteIcon sx={{ fontSize: { xs: 40, md: 60 } }} />
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#555",
                  fontSize: { xs: "0.95rem", sm: "1rem", md: "1.1rem" },
                  lineHeight: { xs: 1.5, md: 1.6 },
                  mt: { xs: 4, md: 6 },
                  mb: { xs: 3, md: 4 },
                  fontStyle: "italic",
                  // Better text handling for mobile
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: { xs: 4, sm: 5, md: "none" },
                  WebkitBoxOrient: "vertical",
                }}
              >
                {testimonial.quote}
              </Typography>
              <Box sx={{ mt: "auto" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#673AB7",
                    fontWeight: 600,
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                  }}
                >
                  {testimonial.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#888",
                    fontSize: { xs: "0.8rem", md: "0.875rem" },
                    whiteSpace: "normal",
                    overflow: "visible",
                    textOverflow: "unset",
                    wordWrap: "break-word",
                  }}
                >
                  {testimonial.role}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Enhanced pagination dots */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: { xs: 2, md: 3 },
          px: 2,
        }}
      >
        {displayTestimonials.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: { xs: 8, md: 10 },
              height: { xs: 8, md: 10 },
              borderRadius: "50%",
              mx: { xs: 0.3, md: 0.5 },
              cursor: "pointer",
              bgcolor: currentIndex === index ? "#673AB7" : "#D1C4E9",
              transition: "all 0.3s ease",
              // Better touch target for mobile
              padding: { xs: "6px", md: "4px" },
              "&:hover": {
                bgcolor: currentIndex === index ? "#5E35B1" : "#B39DDB",
                transform: "scale(1.1)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
