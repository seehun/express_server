import * as jose from "jose";
import { secret } from "../core/auth";

export default async function (req, res, next) {
  const authHeader = req.headers.authorization;

  try {
    const token = authHeader.split(" ")[1];
    await jose.jwtVerify(token, secret);
  } catch (error) {
    return res.status(401).json({
      message: "토큰 인증 실패",
    });
  }

  next();
}
