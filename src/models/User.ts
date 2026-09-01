import { Schema, model, Document, Types } from "mongoose";

// Shape of a User document. Extending Document gives us _id, timestamps, and
// Mongoose's document methods (save, populate, etc.) for free.
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string; // always stored hashed, never plaintext
  profilePicture?: {
    url: string;
    public_id: string;
  };
  bio?: string;
  posts: Types.ObjectId[];
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Cleaned up from the original schema, which mixed `type: Object` with sibling
    // `public_id`/`url` keys at the same level instead of properly nesting them.
    profilePicture: {
      url: { type: String },
      public_id: { type: String },
    },
    bio: {
      type: String,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      // Password should never leave the server, even by accident — this
      // strips it out of every JSON response automatically, so an API route
      // returning a user object can't leak it just by forgetting a
      // .select("-password").
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

const User = model<IUser>("User", userSchema);

export default User;
