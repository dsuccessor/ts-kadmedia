import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req?.headers["token"] as string;
  //   console.log("token =", token);
  if (!token) {
    console.log({ message: "Authentication Token is missing" });
    return res
      .status(401)
      .json({ message: "Authentication Token is missing" });
  }

  const verifyToken = await jwt.verify(
    token,
    process.env.AUTH_KEY as string,
    (err: jwt.VerifyErrors | null) => {
      if (err) {
        console.log({ message: "Invalid authentication Token" });
        return res
          .status(401)
          .json({ message: "Invalid authentication Token" });
      } else {
        next();
      }
    }
  );
};

export { userAuth };
