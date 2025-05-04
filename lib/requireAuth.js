import { parse } from "cookie";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

export async function requireAuth(req) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.authToken;

  if (!token) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      props: {
        user: decoded,
      },
    };
  } catch (err) {
    return { redirect: { destination: "/login", permanent: false } };
  }
}
