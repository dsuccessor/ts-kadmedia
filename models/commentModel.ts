import mongoose, { Schema, Document, Model } from "mongoose";

export interface SubComment {
  user: Schema.Types.ObjectId;
  comment: string;
  image?: string;
  video?: string;
  likes: { user: Schema.Types.ObjectId }[];
}

export const subCommentSchema: Schema<SubComment & Document> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    comment: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    video: {
      type: String,
    },
    likes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          unique: true,
          ref: "user",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export interface SubLike {
  user: Schema.Types.ObjectId;
}

const subLikeSchema: Schema<SubLike & Document> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      unique: true,
      required: true,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

export interface Comment extends Document {
  post: Schema.Types.ObjectId;
  comments: SubComment[];
  likes: SubLike[];
}

const commentSchema: Schema<Comment> = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    unique: true,
    required: true,
    ref: "post",
  },
  comments: [subCommentSchema],
  likes: [
    {
      type: subLikeSchema,
      unique: true,
    },
  ],
});

interface CommentLikeModel extends Model<Comment> {}

const comment_like_Model: CommentLikeModel = mongoose.model<Comment>("comment_like", commentSchema);

export default comment_like_Model;

