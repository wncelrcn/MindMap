import Link from "next/link";
import Image from "next/image";
import { Quicksand } from "next/font/google";
import { Poppins } from "next/font/google";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

const HeaderAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  position: "sticky",
  top: 0,
  zIndex: 100,
}));

const HeaderContainer = styled(Toolbar)(({ theme }) => ({
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0.75rem 1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  [theme.breakpoints.up("sm")]: {
    padding: "0.75rem 1.5rem",
  },
  [theme.breakpoints.up("md")]: {
    padding: "1rem 2rem",
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  [theme.breakpoints.up("sm")]: {
    gap: "0.75rem",
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: `var(--font-quicksand), sans-serif`,
  fontWeight: 500,
  fontSize: "1.25rem",
  color: "#302B7A",
  [theme.breakpoints.up("sm")]: {
    fontSize: "1.5rem",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "1.75rem",
  },
}));

const GetStartedButton = styled(Button)(({ theme }) => ({
  fontFamily: `var(--font-poppins), sans-serif`,
  backgroundColor: "#4F46E5",
  color: "white",
  borderRadius: "9999px",
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#4338CA",
  },
  [theme.breakpoints.up("sm")]: {
    padding: "0.625rem 1.5rem",
    fontSize: "0.925rem",
  },
  [theme.breakpoints.up("md")]: {
    padding: "0.75rem 2rem",
    fontSize: "1rem",
  },
}));

const LandingHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Dynamically calculate logo size based on screen size
  const logoSize = isMobile ? 40 : isTablet ? 50 : 60;

  return (
    <HeaderAppBar
      position="static"
      elevation={0}
      className={`${quicksand.variable} ${poppins.variable}`}
    >
      <HeaderContainer>
        <LogoContainer>
          <Image
            src="/assets/logo.png"
            alt="MindMap Logo"
            width={logoSize}
            height={logoSize}
            priority
          />
          <LogoText variant="h1">MindMap</LogoText>
        </LogoContainer>
        <Box className={poppins.variable}>
          <Link href="/login" passHref style={{ textDecoration: "none" }}>
            <GetStartedButton variant="contained" disableElevation>
              Get Started
            </GetStartedButton>
          </Link>
        </Box>
      </HeaderContainer>
    </HeaderAppBar>
  );
};

export default LandingHeader;
