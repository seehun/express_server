import express from "express";
import { randomUUID } from "crypto";
import {
  userCreateSchema,
  userResponseSchema,
  userPartialUpdateSchema,
} from "../schemas/user.js";
import db from "../db.js";
import { hashSync, compareSync } from "bcrypt";

const router = express.Router();

//유저 생성
router.post("", (req, res) => {
  //검증
  const { error, value } = userCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const user = {
    ...value,
    password: hashSync(value.password, 10),
    id: randomUUID(),
  };
  db.data.users.push(user);
  db.write();

  //반환 시 패스워드가 포함되지 않게 하기
  const { value: userResponseData } = userResponseSchema.validate(user, {
    stripUnknown: true,
  });

  return res.status(201).json({
    _embedded: {
      user: {
        _links: {
          self: {
            href: `${req.originalUrl}/${user.id}`,
          },
        },
        ...userResponseData,
      },
    },
  });
});

//유저 조회
router.get("/:userId", (req, res) => {
  const user = db.data.users.find(({ id }) => id === req.params.userId);

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

  const { value: userResponseData } = userResponseSchema.validate(user, {
    stripUnknown: true,
  });

  return res.status(200).json({
    _embedded: {
      user: {
        _links: {
          self: {
            href: req.originalUrl,
          },
        },
        ...userResponseData,
      },
    },
  });
});

//유저 정보 수정
router.patch("/:userId", (req, res) => {
  const { userId } = req.params;
  const userIndex = db.data.users.findIndex(({ id }) => id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      _links: {
        users: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 게시글 존재 x",
      error: "not found",
    });
  }

  // 게시글 존재 검증 후 값 검증 수행
  const { error, value } = userPartialUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const updatedUser = db.data.users[userIndex];
  //authentication
  if (!compareSync(value.passwordValidation, updatedUser.password)) {
    //password 불일치
    return res.status(401).json({
      message: "인증되지 않은 유저입니다",
    });
  }

  for (const key of Object.keys(value)) {
    updatedUser[key] = value[key];
  }

  db.data.users[userIndex] = updatedUser;
  db.write();

  const { value: userResponseData } = userResponseSchema.validate(updatedUser, {
    stripUnknown: true,
  });

  return res.status(200).json({
    _embedded: {
      article: {
        _links: {
          self: {
            href: req.originalUrl,
          },
        },
        ...userResponseData,
      },
    },
  });
});

//유저 삭제
router.delete("/:userId", (req, res) => {
  const { userId } = req.params;
  const userIndex = db.data.users.findIndex(({ id }) => id === userId);

  if (userIndex === -1) {
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

  // 게시글 존재 검증 후 값 검증 수행
  const deletedUser = db.data.users[userIndex];
  //authentication
  if (!compareSync(req.body.passwordValidation, deletedUser.password)) {
    //password 불일치
    return res.status(401).json({
      message: "인증되지 않은 유저입니다",
    });
  }

  db.data.users.splice(userIndex, 1);
  db.write();

  return res.status(200).json({
    _links: {
      users: {
        href: req.baseUrl,
      },
    },
    message: "user 삭제 완료",
  });
});

export default router;
