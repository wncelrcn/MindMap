import { createClient } from '@/utils/supabase/server-props';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient({ req, res });
    
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const badgeId = fields.badgeId?.[0];
    const file = files.image?.[0];
    
    if (!badgeId || !file) {
      return res.status(400).json({ error: 'Missing badge ID or file' });
    }

    // Read file
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = `badge_${badgeId}_${Date.now()}.${file.originalFilename?.split('.').pop() || 'png'}`;
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('badge-images')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('badge-images')
      .getPublicUrl(fileName);

    // Update badge with image URL
    const { error: updateError } = await supabase
      .from('badges')
      .update({ image_url: publicUrl })
      .eq('badge_id', badgeId);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to update badge' });
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    res.status(200).json({
      success: true,
      imageUrl: publicUrl
    });

  } catch (error) {
    console.error('Error uploading badge image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}