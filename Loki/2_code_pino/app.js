import express from "express";
import logger from "./logger.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.logs = logger.child({
    path : req.url
  });

  next();
});

const posts = [
  {
    id: "1",
    title: "Introduction to Node.js",
    content: "Node.js lets us run JavaScript outside the browser.",
    authorId: "101",
  },
  {
    id: "2",
    title: "What is Express Middleware?",
    content: "Middleware runs during the request response cycle.",
    authorId: "102",
  },
];

// GET all posts
app.get("/posts", async (req, res, next) => {
  try {
    req.logs.info({message:"get all posts"});
    // Simulating database call
    await new Promise((resolve) => setTimeout(resolve, 300));

    res.json({
      success: true,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
});

app.post("/posts", async (req, res, next) => {
  try {
    const { title, content, authorId } = req.body;

    if (!title || !content || !authorId) {
      const error = new Error("title, content and authorId are required");
      error.statusCode = 400;
      error.requestPayload = req.body;
      throw error;
    }

    req.logs.info({ title, authorId }, "Created Post");

    await new Promise((resolve) => setTimeout(resolve, 300));

    const newPost = {
      id: String(posts.length + 1),
      title,
      content,
      authorId,
    };

    posts.push(newPost);
    req.logs.info({ postId : newPost.id }, "Post created successfully");
    
    res.status(201).json({
      success: true,
      data: newPost,
    });
  } catch (err) {
    next(err);
  }
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if(statusCode >= 500){
    req.logs.error({statusCode:statusCode},"Server error");

  }else if (statusCode >= 400){
    req.logs.warn({statusCode:statusCode},"Server error");

  }else{
    req.logs.error({statusCode:statusCode},"Server error");
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    requestId: req.requestId,
  });
});

app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
