import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import sharp from "sharp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if request body is too large
    const contentLength = req.headers["content-length"];
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      // 10MB limit
      return res.status(413).json({
        error: "Request body too large",
        message:
          "Image file is too large. Please compress the image and try again.",
      });
    }

    const { user, aboutMe, profileImage } = req.body;

    // Additional check for profileImage data size
    if (profileImage && profileImage.data) {
      const imageSize = profileImage.data.length;
      // Base64 string should be under 1MB for safety
      if (imageSize > 1024 * 1024) {
        return res.status(413).json({
          error: "Image data too large",
          message:
            "Compressed image is still too large. Please use a smaller or simpler image.",
        });
      }
    }

    if (!user || !user.email) {
      return res.status(400).json({ error: "User email is required" });
    }

    let updates = {};

    // Handle about me update
    if (aboutMe !== undefined) {
      updates.about_me = aboutMe;
    }

    // Handle profile image update with optimized processing
    if (profileImage) {
      try {
        // First get the username from database if not provided
        let username = user.username;

        if (!username) {
          const { data: userData, error: userError } = await supabase
            .from("user_table")
            .select("username")
            .eq("email", user.email)
            .single();

          if (userError) {
            throw new Error(`Failed to get username: ${userError.message}`);
          }

          if (userData) {
            username = userData.username;
          } else {
            throw new Error("User not found");
          }
        }

        if (!username) {
          throw new Error("Username is required for profile image upload");
        }

        const fileName = `${username}_profile.png`;
        const filePath = `${username}/${fileName}`;

        // Decode base64 data
        const imageBuffer = Buffer.from(profileImage.data, "base64");

        // Optimize image before upload - resize to 300x300px
        // This significantly reduces file size while maintaining quality
        const optimizedImageBuffer = await sharp(imageBuffer)
          .resize(300, 300, {
            fit: "cover",
            position: "center",
          })
          .png({ quality: 80 })
          .toBuffer();

        console.log("Original image size:", imageBuffer.length);
        console.log("Optimized image size:", optimizedImageBuffer.length);
        console.log("Uploading to path:", filePath);

        // Upload the optimized file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-pics")
          .upload(filePath, optimizedImageBuffer, {
            contentType: "image/png", // Always use png for consistency
            cacheControl: "3600",
            upsert: true, // Replace existing profile pic
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw uploadError;
        }

        console.log("Upload successful:", uploadData);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-pics").getPublicUrl(filePath);

        console.log("Generated public URL:", publicUrl);

        // Add the URL to updates with a cache-busting parameter to force refresh
        updates.profile_pic_url = `${publicUrl}?t=${Date.now()}`;
      } catch (error) {
        console.error("Error uploading profile image:", error);
        // Don't return immediately, continue with about_me update even if image upload fails
        console.log(
          "Continuing with about_me update despite image upload failure"
        );
        // Just don't add the profile_pic_url to updates
      }
    }

    // First verify the user exists
    let userCheck;
    let userCheckError;

    // Using admin client to bypass RLS for user lookup
    if (user.id) {
      const result = await supabaseAdmin
        .from("user_table")
        .select("*")
        .eq("user_UID", user.id);

      userCheck = result.data;
      userCheckError = result.error;
    }

    // If no results by ID or ID wasn't provided, try email lookup
    if (!userCheck || userCheck.length === 0) {
      console.log("User not found by ID, trying email lookup");
      const result = await supabaseAdmin
        .from("user_table")
        .select("*")
        .eq("email", user.email);

      userCheck = result.data;
      userCheckError = result.error;
    }

    if (userCheckError) {
      console.error("Error checking user:", userCheckError);
      throw userCheckError;
    }

    if (!userCheck || userCheck.length === 0) {
      console.error("User not found with email:", user.email);
      return res.status(404).json({ error: "User not found" });
    }

    // Use the exact details from the database for the update
    const user_UID = userCheck[0].user_UID;
    const username = userCheck[0].username;

    // Only add fields that actually have values to avoid null updates
    const updateFields = {};
    if (updates.about_me !== undefined)
      updateFields.about_me = updates.about_me;
    if (updates.profile_pic_url !== undefined)
      updateFields.profile_pic_url = updates.profile_pic_url;

    // Check if we have any fields to update
    if (Object.keys(updateFields).length === 0) {
      console.log("No fields to update, returning existing user data");
      return res.status(200).json({
        success: true,
        data: userCheck[0],
        message: "No changes needed",
      });
    }

    // Use the admin client to bypass RLS for update and select
    const { data: userData, error: userError } = await supabaseAdmin
      .from("user_table")
      .update(updateFields)
      .eq("user_UID", user_UID)
      .select();

    console.log("Update response:", { userData, userError });

    if (userError) {
      console.error("Error updating user_table:", userError);
      return res.status(500).json({
        error: "Database update failed",
        details: userError.message,
      });
    }

    if (!userData || userData.length === 0) {
      // Construct the expected updated user record with our changes
      const updatedUser = {
        ...userCheck[0],
        ...updateFields,
      };

      return res.status(200).json({
        success: true,
        data: updatedUser,
      });
    }

    return res.status(200).json({ success: true, data: userData });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
