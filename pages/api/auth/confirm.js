import createClient from "@/utils/supabase/api";

function stringOrFirstString(item) {
  return Array.isArray(item) ? item[0] : item;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).appendHeader("Allow", "GET").end();
    return;
  }

  const queryParams = req.query;
  const token_hash = stringOrFirstString(queryParams.token_hash);
  const type = stringOrFirstString(queryParams.type);

  if (!token_hash || !type) {
    console.error("Missing token_hash or type in query params");
    return res.redirect("/error?message=Invalid confirmation link");
  }

  const supabase = createClient(req, res);

  try {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("Email verification error:", error);
      return res.redirect(
        `/error?message=${encodeURIComponent(error.message)}`
      );
    }

    const next = stringOrFirstString(queryParams.next) || "/auth/success";
    return res.redirect(next);
  } catch (err) {
    console.error("Unexpected error during email verification:", err);
    return res.redirect("/error?message=An unexpected error occurred");
  }
}
