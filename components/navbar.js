import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { useRouter } from "next/router";
import { Poppins, Raleway } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("../api/auth/logout", {
      method: "POST",
    });

    if (res.ok) {
      router.push("/");
    } else {
      alert("Logout failed");
    }
  };

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  const navigateTo = (page) => {
    router.push(`/${page}`);
    toggleDrawer(false);
  };

  const drawerContent = (
    <Box
      sx={{ width: 280, backgroundColor: "#2D1B6B", height: "100%" }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: "flex", alignItems: "center", p: 4, pb: 0, pt: 1 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{
            color: "#ffffff",
            fontSize: "2rem",
          }}
        >
          <MenuIcon sx={{ fontSize: "inherit" }} />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", p: 4, pt: 3 }}>
        <Image src="/assets/logo.png" alt="Logo" width={50} height={50} />
        <Typography
          variant="h5"
          sx={{ flexGrow: 1, color: "#ffffff", ml: 2, fontWeight: 600 }}
        >
          MindMap
        </Typography>
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ p: 4, pt: 0 }}>
        {["dashboard", "journals", "profile"].map((text, index) => (
          <Button
            key={text}
            fullWidth
            variant="text"
            sx={{
              color: "#ffffff",
              textAlign: "left",
              justifyContent: "flex-start",
              mb: 2,
              textTransform: "none",
              fontSize: "20px",
            }}
            onClick={() => navigateTo(text)}
            startIcon={
              index === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="32px"
                  viewBox="0 -960 960 960"
                  width="32px"
                  fill="#FFFFFF"
                  style={{ marginRight: "9px" }}
                >
                  <path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z" />
                </svg>
              ) : index === 1 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="32px"
                  viewBox="0 -960 960 960"
                  width="32px"
                  fill="#FFFFFF"
                  style={{ marginRight: "9px" }}
                >
                  <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm0-80h480v-640h-80v280l-100-60-100 60v-280H240v640Zm0 0v-640 640Zm200-360 100-60 100 60-100-60-100 60Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="32px"
                  viewBox="0 -960 960 960"
                  width="32px"
                  fill="#FFFFFF"
                  style={{ marginRight: "9px" }}
                >
                  <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
                </svg>
              )
            }
          >
            {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
          </Button>
        ))}

        {/* Logout Button */}
        <Button
          fullWidth
          variant="text"
          onClick={handleLogout}
          sx={{
            color: "#ffffff",
            textAlign: "left",
            justifyContent: "flex-start",
            position: "absolute",
            bottom: 0,
            left: 0,
            mb: 2,
            p: 4,
            mb: 4,
            fontSize: "20px",
            pt: 0,
            textTransform: "none",
          }}
          startIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="32px"
              viewBox="0 -960 960 960"
              width="32px"
              fill="#FFFFFF"
              style={{ marginRight: "9px" }}
            >
              <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
            </svg>
          }
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: { xs: "1rem", md: "1rem 8rem" },
      }}
    >
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer(true)}
        sx={{
          color: "#2D1B6B",
          fontSize: "2rem",
        }}
      >
        <MenuIcon sx={{ fontSize: "inherit" }} />
      </IconButton>

      {/* Logo + Text Group */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          ml: 4,
        }}
      >
        <Image src="/assets/logo.png" alt="Logo" width={45} height={45} />
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            color: "#2D1B6B",
            lineHeight: 1.2,
            ml: 1,
          }}
        >
          MindMap
        </Typography>
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{ color: "#2D1B6B" }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
