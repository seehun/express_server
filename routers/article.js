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
  res.status(201).json(article);
});

// 게시글 목록 조회
router.get("/articles", (req, res) => {
  res.status(200).json(db.data.articles);
});

// 게시글 상세 조회
router.get("/articles/:articleId", (req, res) => {
  const article = db.data.articles.find(
    ({ id }) => id === req.params.articleId
  );
  if (!article) {
    res.status(404).send();
  }
  res.status(200).json(article);
});

// 게시글 수정
router.put("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(({ id }) => id === articleId);
  if (articleIndex === -1) {
    //게시글이 존재하지 않으면 -1을 리턴
    res.status(404).send();
  }

  const updatedArticle = { ...req.body, id: articleId };

  db.data.articles[articleIndex] = updatedArticle;
  db.write();
  res.status(200).json(updatedArticle);
});

// 게시글 수정
router.patch("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(({ id }) => id === articleId);
  if (articleIndex === -1) {
    res.status(404).send();
  }

  const updatedArticle = db.data.articles[articleIndex];

  for (const key of Object.keys(req.body)) {
    updatedArticle[key] = req.body[key];
  }

  db.data.articles[articleIndex] = updatedArticle;
  db.write();
  res.status(200).json(updatedArticle);
});

// 게시글 삭제
router.delete("/articles/:articleId", (req, res) => {
  const { articleId } = req.params;
  const articleIndex = db.data.articles.findIndex(({ id }) => id === articleId);
  if (articleIndex === -1) {
    res.status(404).send();
  }
  db.data.articles.splice(articleIndex, 1);
  db.write();
  res.status(204).send();
});

export default router;
