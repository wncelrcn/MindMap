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
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress sx={{ color: "#5C35C2" }} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 2, sm: 3 },
            mt: 5,
          }}
        >
          {badges.map((badge) => (
            <Fade in={true} key={badge.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: { xs: 2, sm: 0 },
                }}
              >
                <Tooltip
                  title={
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: poppins.style.fontFamily,
                          color: "white",
                          fontSize: "0.9rem",
                        }}
                      >
                        {badge.badges.description}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: quicksand.style.fontFamily,
                          color: "#ccc",
                          fontSize: "0.8rem",
                          mt: 1,
                        }}
                      >
                        Criteria: {badge.badges.criteria}
                      </Typography>
                    </Box>
                  }
                  placement="top"
                >
                  <Box
                    sx={{
                      width: { xs: 70, sm: 80 },
                      height: { xs: 70, sm: 80 },
                      mr: 2,
                      position: "relative",
                      flexShrink: 0,
                      borderRadius: "50%",
                      ...badgeEffects[badge.badges.color_effect],
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 1,
                    }}
                  >
                    <NextImage
                      src={badge.badges.image_url || "/assets/Group 47671.png"}
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
                  mb: { xs: 2, sm: 0 },
                  opacity: 0.6,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 70, sm: 80 },
                    height: { xs: 70, sm: 80 },
                    mr: 2,
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
      )}
    </>
  );
};

export default Badges;
