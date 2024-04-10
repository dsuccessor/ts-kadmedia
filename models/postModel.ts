import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  post: string;
  image?: string;
  video?: string;
  user: mongoose.Types.ObjectId;
}

const postSchema: Schema<IPost> = new Schema({
  post: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  video: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
}, {
  timestamps: true,
});

const PostModel = mongoose.model<IPost>("post", postSchema);

export default PostModel;
