import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  res.setHeader(
    "Set-Cookie",
    serialize("authToken", "", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })
  );

  res.status(200).json({ message: "Logged out successfully" });
}
