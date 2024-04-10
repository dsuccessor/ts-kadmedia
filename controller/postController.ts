import { Request, Response } from "express";
import followerModel from "../models/followerModel";
import postModel from "../models/postModel";

export interface SocketRequest extends Request {
  socketIo?: any;
  fcmAdmin?: any;
}

const createPost = async (req: SocketRequest, res: Response) => {
  const { post, image, video } = req?.body;
  const { user } = req?.query;
  const io = req?.socketIo;
  const admin = req?.fcmAdmin;

  // Checking for missing field from the client request
  if (!post || !user) {
    console?.log({ message: "Invalid request due to missing field(s)" });
    return res
      ?.status(400)
      ?.json({ message: "Invalid request due to missing field(s)" });
  }

  try {
    const userPost = new postModel({ post, image, video, user });
    await userPost?.save();

    // Sending post notification to the user
    io?.emit("notification", `${user} has just make a post, ${post}`);

    console?.log({ message: "Post created successfully", status: "success", data: userPost });
    return res
      ?.status(200)
      ?.json({ message: "Post created successfully", status: "success", data: userPost });
  } catch (error) {
    console?.log({ message: "Failed to create post", error: error });
    return res
      ?.status(500)
      ?.json({ message: "Failed to create post", error: error });
  }
};

const userFeed = async (req: Request, res: Response) => {
  const { id, pageNo, recordPerPage } = req?.query;

  // Checking for missing field from the client request
  if (!id) {
    console?.log({ message: "Invalid request due to missing field" });
    return res
      ?.status(400)
      ?.json({ message: "Invalid request due to missing field" });
  }

  const followedUsers = await followerModel.findOne({ user: id });
  if (!followedUsers) {
    console?.log({ status: "Failed", message: "No followed user" });
    return res
      ?.status(404)
      ?.json({ status: "Failed", message: "No followed user" });
  }

  if (followedUsers) {
    console?.log("followedUsers = ", followedUsers);

    var feed = [] as any;

    for (let index = 0; index < followedUsers?.follows?.length; index++) {
      const user = followedUsers?.follows[index].user;
      const post = await postModel?.find({user: user as any});
      feed?.push(...post);
    }
    // Handling pagination
    const page = parseInt(pageNo as string);
    const pageSize =
      (parseInt(recordPerPage as string) > 10 && 10) || (parseInt(recordPerPage as string) ?? 5);
    const startIndex = pageSize * (page - 1);
    const endIndex = page * pageSize;
    const recordSize = feed?.length;
    const allPages = recordSize % pageSize > 0
    ? Math?.floor(recordSize / pageSize) + 1
    : Math?.floor(recordSize / pageSize)

    if (page > allPages){
      console?.log({
        status: "Failed",
        message: "Page does not exist",
        data: {pageInfo: {
          currentPage: page,
          recordPerPage: pageSize,
          totalPages:allPages,
          totalRecords: recordSize,
        }},
      });
      return res?.status(200)?.json({
        status: "Failed",
        message: "Page does not exist",
        data: {pageInfo: {
          currentPage: page,
          recordPerPage: pageSize,
          totalPages:allPages,
          totalRecords: recordSize,
        }},
      });
    }

    const result = feed?.slice(startIndex, endIndex);
    const feedAndPage = {
      result,
      pageInfo: {
        currentPage: page,
        recordPerPage: pageSize,
        totalPages:allPages,
        totalRecords: recordSize,
      },
    };

    console?.log({
      status: "Success",
      message: "Followed user's posts was fetched",
      data: feedAndPage,
    });
    return res?.status(200)?.json({
      status: "Success",
      message: "Followed user's posts was fetched",
      data: feedAndPage,
    });
  }
};

export { createPost, userFeed };
