const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: [1000, "Post text cannot exceed 1000 characters"],
    },
    image: {
      type: String,
      trim: true,
    },
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        commentedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: At least text or image must be present
postSchema.pre("validate", function (next) {
  if (!this.text && !this.image) {
    next(new Error("Post must have either text or image"));
  } else {
    next();
  }
});

// Index for faster queries
postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1 });

module.exports = mongoose.model("Post", postSchema);
