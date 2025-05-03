import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { data: user, error } = await supabase
      .from("user_table")
      .select("email, password_hash")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Return user data (excluding the password hash)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return res.status(200).json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
}
