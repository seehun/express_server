import { randomUUID } from "crypto";
import express from "express";
import db from "../db.js";

const router = express.Router();

//crud 만들기

// 게시글 생성
router.post("/articles", (req, res) => {
  const article = {
    ...req.body,
    id: randomUUID(),
  };
  //   data.push(article);
  db.data.articles.push(article);
  db.write();

  res.set("Content-Type", "application/vnd.hal+json");
  res.status(201).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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
  res.set("Content-Type", "application/vnd.hal+json");
  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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

  res.set("Content-Type", "application/vnd.hal+json");
  if (!article) {
    res.status(404).json({
      _links: {
        self: {
          href: req.originalUrl,
        },
        articles: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 게시글 존재 x",
      error: "not found",
    });
  }

  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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

  res.set("Content-Type", "application/vnd.hal+json");
  if (articleIndex === -1) {
    //게시글이 존재하지 않으면 -1을 리턴
    res.status(404).json({
      _links: {
        self: {
          href: req.originalUrl,
        },
        articles: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 게시글 존재 x",
      error: "not found",
    });
  }

  const updatedArticle = { ...req.body, id: articleId };

  db.data.articles[articleIndex] = updatedArticle;
  db.write();
  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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

  res.set("Content-Type", "application/vnd.hal+json");
  if (articleIndex === -1) {
    res.status(404).json({
      _links: {
        self: {
          href: req.originalUrl,
        },
        articles: {
          href: req.baseUrl,
        },
      },
      message: "조회하려는 게시글 존재 x",
      error: "not found",
    });
  }

  const updatedArticle = db.data.articles[articleIndex];

  for (const key of Object.keys(req.body)) {
    updatedArticle[key] = req.body[key];
  }

  db.data.articles[articleIndex] = updatedArticle;
  db.write();

  res.set("Content-Type", "application/vnd.hal+json");
  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
    },
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

  res.set("Content-Type", "application/vnd.hal+json");
  if (articleIndex === -1) {
    res.status(404).json({
      _links: {
        self: {
          href: req.originalUrl,
        },
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
  res.status(200).json({
    _links: {
      self: {
        href: req.originalUrl,
      },
      articles: {
        href: req.baseUrl,
      },
    },
    message: "게시글 삭제 완료",
  });
});

export default router;
