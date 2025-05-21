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
    <Box sx={{ position: "relative", width: "100%", my: 4 }}>
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
        }}
      >
        {displayTestimonials.map((testimonial, index) => (
          <Card
            key={testimonial.id}
            sx={{
              display: "flex",
              minWidth: "70%",
              maxWidth: 450,
              flexShrink: 0,
              flexDirection: { xs: "column", md: "row" },
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
              height: { xs: "auto", md: 400 },
              margin: { xs: "0 auto", md: "0 50px" },
            }}
          >
            <CardMedia
              component="img"
              sx={{
                width: { xs: "100%", md: "50%" },
                height: { xs: 300, md: "100%" },
                objectFit: "cover",
              }}
              image={testimonial.image}
              alt={`${testimonial.name} testimonial`}
            />
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 4,
                width: { xs: "100%", md: "50%" },
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  color: "#673AB7",
                  opacity: 0.8,
                }}
              >
                <FormatQuoteIcon sx={{ fontSize: 60 }} />
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#555",
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                  mt: 6,
                  mb: 4,
                  fontStyle: "italic",
                }}
              >
                {testimonial.quote}
              </Typography>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: "#673AB7", fontWeight: 600 }}
                >
                  {testimonial.name}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#888" }}>
                  {testimonial.role}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Pagination dots */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
        }}
      >
        {displayTestimonials.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              mx: 0.5,
              cursor: "pointer",
              bgcolor: currentIndex === index ? "#673AB7" : "#D1C4E9",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
