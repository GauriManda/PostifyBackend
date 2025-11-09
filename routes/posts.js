const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(100); // Limit to last 100 posts

    console.log(`📋 Fetched ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Public (should be protected in production)
router.post("/", async (req, res) => {
  try {
    const { userId, username, text, image } = req.body;

    // Validation
    if (!userId || !username) {
      return res.status(400).json({
        message: "User information is required",
      });
    }

    if (!text && !image) {
      return res.status(400).json({
        message: "Post must have text or image",
      });
    }

    // Create new post
    const post = new Post({
      userId,
      username,
      text: text ? text.trim() : "",
      image: image ? image.trim() : "",
    });

    await post.save();

    console.log("✅ New post created by:", username);
    res.status(201).json(post);
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({
      message: "Error creating post",
      error: error.message,
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Public
router.post("/:id/like", async (req, res) => {
  try {
    const { userId, username } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked the post
    const likeIndex = post.likes.findIndex(
      (like) => like.userId.toString() === userId
    );

    if (likeIndex > -1) {
      // Unlike: Remove the like
      post.likes.splice(likeIndex, 1);
      console.log(`👎 ${username} unliked post ${post._id}`);
    } else {
      // Like: Add the like
      post.likes.push({ userId, username });
      console.log(`👍 ${username} liked post ${post._id}`);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("❌ Error liking post:", error);
    res.status(500).json({
      message: "Error liking post",
      error: error.message,
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Comment on a post
// @access  Public
router.post("/:id/comment", async (req, res) => {
  try {
    const { userId, username, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add comment
    post.comments.push({
      userId,
      username,
      text: text.trim(),
    });

    await post.save();

    console.log(`💬 ${username} commented on post ${post._id}`);
    res.json(post);
  } catch (error) {
    console.error("❌ Error commenting on post:", error);
    res.status(500).json({
      message: "Error commenting on post",
      error: error.message,
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Public (should verify ownership in production)
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("🗑️ Post deleted:", req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    res.status(500).json({
      message: "Error deleting post",
      error: error.message,
    });
  }
});

module.exports = router;
