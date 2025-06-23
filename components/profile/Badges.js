import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Fade,
} from "@mui/material";
import { Raleway, Poppins, Quicksand } from "next/font/google";
import NextImage from "next/image";
import { badgeEffects } from "@/utils/helper/profile/badgeEffects";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

const Badges = ({ badges, badgesLoading }) => {
  return (
    <>
      {badgesLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#5C35C2" }} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: { xs: 3, sm: 4, md: 3 },
              mt: { xs: 3, sm: 4, md: 5 },
              width: "100%",
              maxWidth: { xs: "100%", sm: "100%", md: "900px", lg: "1000px" },
              mx: "auto",
              px: { xs: 2, sm: 1, md: 0 },
            }}
          >
            {badges.map((badge) => (
              <Fade in={true} key={badge.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    flexDirection: { xs: "column", sm: "row" },
                    textAlign: { xs: "center", sm: "left" },
                    p: { xs: 2, sm: 1 },
                  }}
                >
                  <Tooltip
                    title={
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, #5C35C2 0%, #7B52E6 100%)",
                          boxShadow: "0 8px 32px rgba(92, 53, 194, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                          maxWidth: { xs: 280, sm: 300 },
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: poppins.style.fontFamily,
                            color: "white",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            fontWeight: 500,
                            mb: 1.5,
                            lineHeight: 1.4,
                          }}
                        >
                          {badge.badges.description}
                        </Typography>
                        <Box
                          sx={{
                            pt: 1.5,
                            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: quicksand.style.fontFamily,
                              color: "rgba(255, 255, 255, 0.9)",
                              fontSize: { xs: "0.8rem", sm: "0.85rem" },
                              fontWeight: 600,
                              mb: 0.5,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Criteria
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: quicksand.style.fontFamily,
                              color: "rgba(255, 255, 255, 0.8)",
                              fontSize: { xs: "0.85rem", sm: "0.9rem" },
                              lineHeight: 1.3,
                            }}
                          >
                            {badge.badges.criteria}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    placement="top"
                    arrow
                    PopperProps={{
                      sx: {
                        "& .MuiTooltip-tooltip": {
                          backgroundColor: "transparent",
                          padding: 0,
                          margin: { xs: "4px 0", sm: "8px 0" },
                        },
                        "& .MuiTooltip-arrow": {
                          color: "#5C35C2",
                          "&::before": {
                            background:
                              "linear-gradient(135deg, #5C35C2 0%, #7B52E6 100%)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          },
                        },
                        zIndex: 1500,
                      },
                    }}
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 200 }}
                    enterTouchDelay={0}
                    leaveTouchDelay={2500}
                    enterDelay={{ xs: 0, sm: 500 }}
                    leaveDelay={{ xs: 0, sm: 200 }}
                    disableHoverListener={{ xs: true, sm: false }}
                    disableFocusListener
                  >
                    <Box
                      sx={{
                        width: { xs: 80, sm: 70, md: 80 },
                        height: { xs: 80, sm: 70, md: 80 },
                        mr: { xs: 0, sm: 2 },
                        mb: { xs: 1, sm: 0 },
                        position: "relative",
                        flexShrink: 0,
                        borderRadius: "50%",
                        ...badgeEffects[badge.badges.color_effect],
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        p: 1,
                        cursor: "pointer",
                        transition: "transform 0.2s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.08)",
                        },
                        "&:active": {
                          transform: "scale(0.95)",
                        },
                      }}
                    >
                      <NextImage
                        src={
                          badge.badges.image_url || "/assets/Group 47671.png"
                        }
                        alt={badge.badges.name}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                  </Tooltip>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: poppins.style.fontFamily,
                        color: "#5C35C2",
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {badge.badges.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: quicksand.style.fontFamily,
                        color: "#777",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    >
                      {new Date(badge.unlocked_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            ))}
            {badges.length < 6 &&
              [...Array(6 - badges.length)].map((_, index) => (
                <Box
                  key={`placeholder-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    flexDirection: { xs: "column", sm: "row" },
                    textAlign: { xs: "center", sm: "left" },
                    p: { xs: 2, sm: 1 },
                    opacity: 0.6,
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 80, sm: 70, md: 80 },
                      height: { xs: 80, sm: 70, md: 80 },
                      mr: { xs: 0, sm: 2 },
                      mb: { xs: 1, sm: 0 },
                      position: "relative",
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "#e0e0e0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <NextImage
                      src="/assets/Group 47671.png"
                      alt="Locked Badge"
                      fill
                      style={{ objectFit: "contain", opacity: 0.5 }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: poppins.style.fontFamily,
                        color: "#5C35C2",
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      Locked Badge
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: quicksand.style.fontFamily,
                        color: "#777",
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      }}
                    >
                      Complete goals to unlock
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Badges;
