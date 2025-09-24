import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.cookies.token; // read cookie

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
