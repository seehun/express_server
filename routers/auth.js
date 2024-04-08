import express from "express";
import { authCreateSchema } from "../schemas/auth.js";
import db from "../db.js";
import { compareSync } from "bcrypt";
import * as jose from "jose";
import { secret } from "../core/auth.js";

const router = express.Router();

// 로그인 ->  토큰 반환
router.post("", async (req, res) => {
  const { error, value } = authCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const user = db.data.users.find(
    ({ username }) => username === value.username
  );

  if (!user) {
    return res.status(404).json({
      _links: {
        users: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 user 존재 x",
      error: "not found",
    });
  }

  //authentication
  if (!compareSync(value.password, user.password)) {
    //password 불일치
    return res.status(401).json({
      message: "인증되지 않은 유저입니다",
    });
  }

  //id,pw 다 일치  -> 토큰 반환
  const alg = "HS256";

  return res.status(201).json({
    accessToken: await new jose.SignJWT({ user_id: user.id })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret),
  });
});

export default router;
