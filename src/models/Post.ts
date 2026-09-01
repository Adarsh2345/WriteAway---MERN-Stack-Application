import { Schema, model, Document, Types } from "mongoose";

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  author: Types.ObjectId;
  images: {
    url: string;
    public_id: string;
  }[];
  comments: Types.ObjectId[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: true,
      maxlength: 20000, // generous limit for rich-text HTML from the Quill editor
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    // Stored lowercase so filtering/search is case-insensitive without extra
    // normalization at query time.
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Powers the free-text search box (title/content). MongoDB allows only one text
// index per collection, so title and content share this one.
postSchema.index({ title: "text", content: "text" });
// Powers "newest first" sorting on the posts listing.
postSchema.index({ createdAt: -1 });

const Post = model<IPost>("Post", postSchema);

export default Post;
