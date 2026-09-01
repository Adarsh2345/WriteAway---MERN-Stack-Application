import { Schema, model, Document, Types } from "mongoose";

// Tracks every file we've uploaded to Cloudinary, so we can look them up and
// delete them later (e.g. when a post or account is removed).
export interface IFile extends Document {
  _id: Types.ObjectId;
  url: string;
  public_id: string;
  uploaded_by: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    uploaded_by: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const File = model<IFile>("File", fileSchema);

export default File;
