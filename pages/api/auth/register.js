import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, email, birthday, gender, user_UID } = req.body;

    // Input validation
    if (!name || !email || !birthday || !gender || !user_UID) {
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

    // Default about me text
    const defaultAboutMe =
      "Hey! I just joined MindMap to start tracking my thoughts, emotions, and personal growth. I'm excited to use this space to reflect, stay mindful, and build healthier habits one day at a time.";

    // Default profile picture path
    const defaultProfilePicPath = path.join(
      process.cwd(),
      "public/assets/default_profile.png"
    );

    // Generate a unique filename
    const filename = `default_profile.png`;
    const filePath = `${name}/${filename}`;

    // Default profile picture URL
    let publicUrl = null;

    // Read the default profile picture
    const fileBuffer = fs.readFileSync(defaultProfilePicPath);

    // Upload the default profile picture to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pics")
      .upload(filePath, fileBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading profile picture:", uploadError);
      // Continue
    } else {
      // Get the public URL
      const {
        data: { publicUrl: uploadedUrl },
      } = supabase.storage.from("profile-pics").getPublicUrl(filePath);
      publicUrl = uploadedUrl;
    }

    // Insert the user into the database
    const { data: userData, error: userError } = await supabase
      .from("user_table")
      .insert([
        {
          user_UID,
          username: name,
          email,
          birthday,
          gender,
          about_me: defaultAboutMe,
          profile_pic_url: publicUrl,
        },
      ])
      .select();

    if (userError) {
      console.error("Error inserting user:", userError);
      return res.status(500).json({ message: "Failed to register user" });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: userData[0].user_UID,
        name: userData[0].username,
        email: userData[0].email,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}
