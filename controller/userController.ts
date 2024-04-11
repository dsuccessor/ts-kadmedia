import { Request, Response } from "express";
import userModel, { User } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { removePwd } from "../middleware/pwdRemover";

interface LoginRequestBody {
  email: string;
  password: string;
}

const registerUser = async (req: Request, res: Response) => {
  const {
    username,
    lastname,
    firstname,
    email,
    phone,
    fcmtoken,
    passport,
    gender,
    password,
  } = req.body as User;

  // Check if the fields coming from the client are completed
  if (
    !username ||
    !lastname ||
    !firstname ||
    !email ||
    !phone ||
    !passport ||
    !gender ||
    !password ||
    !fcmtoken
  ) {
    console.log({
      message: "Incomplete field, Kindly provide the missing field",
    });
    return res
      .status(400)
      .json({ message: "Incomplete field, Kindly provide the missing field" });
  }

  // Check if user account already exists
  const ifUserExist = await userModel.findOne({$or: [{email: email}, {fcmtoken: fcmtoken}, {username: username}]});
  if (ifUserExist) {
    console.log({ message: `User already exist`, status: 'failed', error: "" });
    return res
      .status(403)
      .json({ message: `User already exist`, status: 'failed', error: "" });
  }

  // Encrypt password before creating user account
  const hashedPassword = await bcrypt.hash(password, 10);
  if (!hashedPassword) {
    console.log({ message: `Failed to hash password` });
    return res.status(500).json({ message: "Failed to encrypt user password" });
  }

  // Create a user account
  try {
    const register = await userModel.create({
      username,
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      gender,
      fcmtoken,
      passport,
    });

    const result = await removePwd((register as any)._doc);

    console.log({
      message: "User account created successfully",
      status: "success",
      data: result,
    });
    return res.status(200).json({
      message: "User account created successfully",
      status: "success",
      data: result,
    });
  } catch (err) {
    console.log({ message: "Failed to register user", error: err });
    return res.status(500).json({ message: "Failed to register user", error: err });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginRequestBody;

  // Checking if username and password is supplied from the client
  if (!email || !password) {
    console.log({ message: "Username or Password is required" });
    return res
      .status(400)
      .json({ message: "Username or Password is required" });
  }

  // Check if username and password is valid
  const userValid = await userModel.findOne({ email });

  if (!userValid) {
    console.log({ message: "Invalid email address, Access denied.", status: "failed", error: "" });
    return res
      .status(401)
      .json({ message: "Invalid email address, Access denied.", status: "failed", error: "" });
  }

  const passwordCheck = await bcrypt.compare(password, userValid?.password);
  if (!passwordCheck) {
    console.log({ message: "Invalid password", status: "failed", error: passwordCheck  });
    return res.status(401).json({ message: "Invalid password", status: "failed", error: passwordCheck });
  }

  const token = jwt.sign({ email, password }, process.env.AUTH_KEY!, {
    expiresIn: 60 * 20,
  });
  // const {_doc, ...rest} = userValid as any
  const result = await removePwd((userValid as any)._doc);

  console.log({
    message: "Credentials confirmed, Access granted.",
    status: "success",
    data: result,
  });

  res.setHeader("token", token);
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("auth-token", token, {
      maxAge: 60 * 10,
      httpOnly: true,
      sameSite: "none",
      path: "/api",
    })
  );
  return res.status(200).json({
    message: "Credentials confirmed, Access granted.",
    status: "success",
    data: result,
  });
};

export { registerUser, loginUser };
