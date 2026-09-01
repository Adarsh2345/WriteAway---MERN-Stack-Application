import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  post: Types.ObjectId;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    post: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;
