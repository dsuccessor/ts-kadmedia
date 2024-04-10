import mongoose, { Schema, Document } from "mongoose";

// Define User Schema Type
export interface User extends Document {
  username: string;
  lastname: string;
  firstname: string;
  email: string;
  fcmtoken: string;
  phone: number;
  passport: string;
  gender: "male" | "female" | "others";
  password: string;
}

// Define User Schema
const userSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  lastname: {
    type: String,
    required: true,
    lowercase: true
  },
  firstname: {
    type: String,
    required: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  fcmtoken: {
    type: String,
    lowercase: true,
    unique: true
  },
  phone: {
    type: Number,
    required: true,
    lowercase: true,
    minlength: 11,
    unique: true
  },
  passport: {
    type: String,
    required: true,
    unique: true
  },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Define User Model
const userModel = mongoose.model<User>("User", userSchema);

export default userModel;
