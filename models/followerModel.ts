import mongoose, { Schema, Document } from "mongoose";

export interface IFollowSubDocument extends Document {
  user: Schema.Types.ObjectId;
}

const followSubSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

interface IFollowerSubDocument extends Document {
  user: Schema.Types.ObjectId;
}

const followerSubSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

export interface IFollowerDocument extends Document {
  user: Schema.Types.ObjectId;
  follows: IFollowSubDocument[];
  followers: IFollowerSubDocument[];
}

const followerSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      unique: true,
      required: true,
      ref: "user",
    },
    follows: [followSubSchema],
    followers: [followerSubSchema],
  },
  {
    timestamps: true,
  }
);

const followerModel = mongoose.model<IFollowerDocument>("follower", followerSchema);

export default followerModel; 
