import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user, aboutMe, profileImage } = req.body;

    if (!user || !user.email) {
      return res.status(400).json({ error: "User email is required" });
    }

    let updates = {};

    // Handle about me update
    if (aboutMe !== undefined) {
      updates.about_me = aboutMe;
    }

    // Handle profile image update
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

        console.log("Uploading to path:", filePath);
        console.log("Image data length:", profileImage.data.length);

        // Upload the file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-pics")
          .upload(filePath, Buffer.from(profileImage.data, "base64"), {
            contentType: profileImage.type,
            cacheControl: "3600",
            upsert: true, // We want to replace existing profile pic
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

    // First verify the user exists, checking by email since that's what the frontend is sending
    let userCheck;
    let userCheckError;

    // First try to get user by user_UID if available
    if (user.id) {
      const result = await supabase
        .from("user_table")
        .select("*")
        .eq("user_UID", user.id);

      userCheck = result.data;
      userCheckError = result.error;
    }

    // If no results by ID or ID wasn't provided, try email lookup
    if (!userCheck || userCheck.length === 0) {
      console.log("User not found by ID, trying email lookup");
      const result = await supabase
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

    console.log("User check results:", userCheck);
    console.log(
      "User record structure:",
      userCheck && userCheck[0] ? Object.keys(userCheck[0]) : "No user found"
    );

    if (!userCheck || userCheck.length === 0) {
      console.error("User not found with email:", user.email);
      return res.status(404).json({ error: "User not found" });
    }

    // Use the exact details from the database for the update
    const exactEmail = userCheck[0].email;
    const user_UID = userCheck[0].user_UID;
    console.log("Using exact email from database:", exactEmail);
    console.log("Using user_UID:", user_UID);

    // Get username to use for the update query
    const username = userCheck[0].username;

    // Debug what we're updating
    console.log("Updating user_table with:", { username, updates });

    // Update user profile in database using user_UID from database
    console.log("Direct updates object:", updates);

    // Only add fields that actually have values to avoid null updates
    const updateFields = {};
    if (updates.about_me !== undefined)
      updateFields.about_me = updates.about_me;
    if (updates.profile_pic_url !== undefined)
      updateFields.profile_pic_url = updates.profile_pic_url;

    console.log("Filtered update fields:", updateFields);

    // Check if we have any fields to update
    if (Object.keys(updateFields).length === 0) {
      console.log("No fields to update, returning existing user data");
      return res.status(200).json({
        success: true,
        data: userCheck[0],
        message: "No changes needed",
      });
    }

    // Try the update with the user_UID
    const { data: userData, error: userError } = await supabase
      .from("user_table")
      .update(updateFields)
      .eq("user_UID", user_UID)
      .select();

    console.log("Update response:", { userData, userError });

    console.log("Comparing username from input:", user.username);
    console.log("Username from database:", username);
    console.log("Match result:", user.username === username);
    console.log("Previous values:", {
      about_me: userCheck[0].about_me,
      profile_pic_url: userCheck[0].profile_pic_url,
    });

    if (userError) {
      console.error("Error updating user_table:", userError);

      // Try email matching as fallback
      console.log("Trying email matching as fallback");

      const { data: emailData, error: emailError } = await supabase
        .from("user_table")
        .update(updates)
        .eq("email", exactEmail)
        .select();

      if (emailError) {
        console.error("Email update error:", emailError);

        // As a last resort, try username matching
        console.log("Trying username matching as last resort");

        const { data: usernameData, error: usernameError } = await supabase
          .from("user_table")
          .update(updates)
          .eq("username", username)
          .select();

        if (usernameError) {
          console.error("Username update error:", usernameError);

          // If all attempts fail
          return res.status(500).json({
            error:
              "Database update failed. Please check your RLS policies for user_table.",
            details: usernameError.message,
          });
        }

        console.log("Username update result:", usernameData);
        return res.status(200).json({ success: true, data: usernameData });
      }

      console.log("Email update result:", emailData);
      return res.status(200).json({ success: true, data: emailData });
    }

    // If the update succeeded but returned no data, return the pre-update data
    // This can happen due to RLS policies that allow updates but not selects
    if (!userError && (!userData || userData.length === 0)) {
      console.log(
        "Update successful but returned no data. Returning pre-update user data."
      );

      // Construct the expected updated user record with our changes
      const updatedUser = {
        ...userCheck[0],
        ...updateFields,
      };

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message:
          "Update successful but select failed. Returning reconstructed data.",
      });
    }

    console.log("Update successful:", userData);
    return res.status(200).json({ success: true, data: userData });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
