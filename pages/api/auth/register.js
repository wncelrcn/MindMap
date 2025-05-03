import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, email, birthday, gender, password } = req.body;

    // Input validation
    if (!name || !email || !birthday || !gender || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate gender
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("user_table")
      .select("email")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking email:", checkError);
      return res.status(500).json({ message: "Error checking email" });
    }

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password (NEVER store plain text passwords)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const { data, error } = await supabase
      .from("user_table")
      .insert([
        {
          username: name,
          email,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          is_active: true,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting user:", error);
      return res.status(500).json({ message: "Failed to register user" });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}
