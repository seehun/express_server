import * as jose from "jose";
import { secret } from "../core/auth.js";

export default async function (req, res, next) {
  const authHeader = req.headers.authorization;

  try {
    const token = authHeader.split(" ")[1];
    const verifiedToken = await jose.jwtVerify(token, secret);
    req.auth = {
      user_id: verifiedToken.payload.user_id,
    };
  } catch (error) {
    return res.status(401).json({
      message: "토큰 인증 실패",
    });
  }

  next();
}
