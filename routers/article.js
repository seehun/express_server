import { randomUUID } from "crypto";
import express from "express";
import db from "../db.js";
import {
  articleCreateSchema,
  articleUpdateSchema,
  articlePartialUpdateSchema,
} from "../schemas/article.js";
import { logger } from "../core/logger.js";

const router = express.Router();

//crud 만들기

// 게시글 생성
router.post("/articles", (req, res) => {
  const { error, value } = articleCreateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const article = {
    ...req.body,
    id: randomUUID(),
  };
  db.data.articles.push(article);
  db.write();

  return res.status(201).json({
    _embedded: {
      _links: {
        self: {
          href: `${req.originalUrl}/${article.id}`,
        },
      },
      ...article,
    },
  });
});

// 게시글 목록 조회
router.get("/articles", (req, res) => {
  logger.debug("게시글 목록 조회");
  return res.status(200).json({
    _embedded: {
      articles: db.data.articles.map((article) => ({
        _links: {
          self: {
            href: `${req.originalUrl}/${article.id}`,
          },
        },
        ...article,
      })),
    },
  });
});

// 게시글 상세 조회
router.get("/articles/:articleId", (req, res) => {
  const article = db.data.articles.find(
    ({ id }) => id === req.params.articleId
  );

  if (!article) {
    return res.status(404).json({
      _links: {
        articles: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 게시글 존재 x",
      error: "not found",
    });
  }

  return res.status(200).json({
    _embedded: {
      article: {
        _links: {
          self: {
            href: req.originalUrl,
          },
        },
        ...article,
      },
    },
  });
});

// 게시글 수정
router.put("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(({ id }) => id === articleId);

  if (articleIndex === -1) {
    //게시글이 존재하지 않으면 -1을 리턴
    return res.status(404).json({
      _links: {
        articles: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 게시글 존재 x",
      error: "not found",
    });
  }

  // 게시글 존재 검증 후 값 검증 수행
  const { error, value } = articleUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const updatedArticle = { ...value, id: articleId };

  db.data.articles[articleIndex] = updatedArticle;
  db.write();
  return res.status(200).json({
    _embedded: {
      article: {
        _links: {
          self: {
            href: req.originalUrl,
          },
        },
        ...updatedArticle,
      },
    },
  });
});

// 게시글 수정
router.patch("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(({ id }) => id === articleId);

  if (articleIndex === -1) {
    return res.status(404).json({
      _links: {
        articles: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 게시글 존재 x",
      error: "not found",
    });
  }

  // 게시글 존재 검증 후 값 검증 수행
  const { error, value } = articleUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const updatedArticle = db.data.articles[articleIndex];

  for (const key of Object.keys(value)) {
    updatedArticle[key] = value[key];
  }

  db.data.articles[articleIndex] = updatedArticle;
  db.write();

  return res.status(200).json({
    _embedded: {
      article: {
        _links: {
          self: {
            href: req.originalUrl,
          },
        },
        ...updatedArticle,
      },
    },
  });
});

// 게시글 삭제
router.delete("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(({ id }) => id === articleId);

  if (articleIndex === -1) {
    return res.status(404).json({
      _links: {
        articles: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 게시글 존재 x",
      error: "not found",
    });
  }
  db.data.articles.splice(articleIndex, 1);
  db.write();
  return res.status(200).json({
    _links: {
      articles: {
        href: req.baseUrl,
      },
    },
    message: "게시글 삭제 완료",
  });
});

export default router;
