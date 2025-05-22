import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return res
          .status(401)
          .json({ message: "Please verify your email before logging in." });
      }
      if (error.message.includes("Invalid login credentials")) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      throw error;
    }

    res.status(200).json({
      message: "Login successful",
      user: data.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
}
