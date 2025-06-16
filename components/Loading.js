import { CircularProgress, Box } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: "#5E35B1",
        }}
      />
    </Box>
  );
}
