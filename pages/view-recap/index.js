import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

const cardContents = [
  "Card 1: Growth in Challenges",
  "Card 2: Reflection",
  "Card 3: Achievements",
  "Card 4: Lessons Learned",
  "Card 5: Looking Forward",
];

export default function ViewRecap() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (index < cardContents.length - 1) {
        setDirection(-1);
        setIndex((i) => i + 1);
      }
    },
    onSwipedRight: () => {
      if (index > 0) {
        setDirection(1);
        setIndex((i) => i - 1);
      }
    },
    trackMouse: true,
  });

  return (
    <Box
      position="relative"
      minHeight="100vh"
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ overflow: "hidden" }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Image
          src="/assets/recap/recap-bg.png"
          alt="Recap background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </Box>
      {/* Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          {...swipeHandlers}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{
                x: direction === 0 ? 0 : direction > 0 ? -60 : 60,
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                x: 0,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                x: direction < 0 ? -60 : 60,
                opacity: 0,
                scale: 0.98,
              }}
              transition={{
                x: { type: "spring", stiffness: 260, damping: 20 },
                opacity: { duration: 0.35 },
                scale: { type: "spring", stiffness: 260, damping: 20 },
              }}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 16px 48px rgba(60,40,120,0.16)",
                padding: 40,
                minWidth: 500,
                minHeight: 800,
                maxWidth: "90vw",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Typography variant="h5" color="primary" fontWeight={600}>
                {cardContents[index]}
              </Typography>
              <Typography sx={{ mt: 2, color: "#888" }}>
                {index + 1} / {cardContents.length}
              </Typography>
            </motion.div>
          </AnimatePresence>
        </div>
      </Box>
    </Box>
  );
}
