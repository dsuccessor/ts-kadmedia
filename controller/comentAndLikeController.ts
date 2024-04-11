import { Request, Response, NextFunction } from "express";
import comment_like_Model from "../models/commentModel";
import { Socket } from "socket.io";
import { SocketRequest } from "./postController";
import mongoose from "mongoose";

// well commented
const commentOnPost = async (req: SocketRequest, res: Response) => {
  const { postId, userId } = req.query;
  const { comment, image, video } = req.body;
  const io = req.socketIo;

  // checking if all variables needed for the requests are present
  if (!postId || !userId || !comment) {
    console.log({ message: "Invalid request", status: "Failed" });
    res.status(400).json({ message: "Invalid request", status: "Failed" });
    return;
  }

  // Checking if any user has commented on the current post
  const postExist = await comment_like_Model.findOne({ post: postId });

  // posting comment under the current post
  if (postExist) {

    const pushPost = await comment_like_Model.findOneAndUpdate({ post: postId }, { $push: { comments: { user: userId, comment: comment, image: image, video: video } } }, { new: true });
    if (pushPost) {
      // Sending comment notification to the user
      io.emit(
        "notification",
        `${userId} has just commeted on your post, ${postId}`
      );

      // sending feedback to the client
      console.log({
        message: "Comment Saved",
        status: "success",
        data: pushPost,
      });
      res
        .status(200)
        .json({ message: "Comment Saved", status: "success", data: pushPost });
    }

    if (!pushPost) {
      console.log({
        message: "Failed to save comment",
        status: "Failed",
        error: pushPost,
      });
      res.status(500).json({
        message: "Failed to save comment",
        status: "Failed",
        error: pushPost,
      });
    }

  } else {
    const postComment = await comment_like_Model.create({
      post: postId,
      comments: { user: userId, comment, image, video },
    });

    if (!postComment) {
      console.log({
        message: "Failed to save comment",
        status: "Failed",
        error: postComment,
      });

      return res.status(500).json({
        message: "Failed to save comment",
        status: "Failed",
        error: postComment,
      });
    }

    // Sending comment notification to the user
    io.emit(
      "notification",
      `${userId} has just commeted on your post, ${postId}`
    );

    console.log({
      message: "Comment Saved",
      status: "success",
      data: postComment,
    });
    res.status(200).json({
      message: "Comment Saved",
      status: "success",
      data: postComment,
    });
  }
};

const likePost = async (req: SocketRequest, res: Response) => {
  const { postId, userId } = req.query;
  const io: Socket = req.socketIo;

  // checking if all variables needed for the requests are present
  if (!postId || !userId) {
    console.log({ message: "Invalid request", status: "Failed" });
    res.status(400).json({ message: "Invalid request", status: "Failed" });
    return;
  }

  // Checking if any user has liked the current post
  const postExist = await comment_like_Model.findOne({ post: postId });
  //  if yes,
  if (postExist) {
    // checking if the post has been liked by the user before
    const userExist = postExist.likes.find((item) => {
      return item.user == userId as any;
    });
    //  if yes, then inform the user by sending feedback to the client
    if (userExist) {
      console.log({
        message: "User already like the post",
        status: "Failed",
      });
      return res
        .status(403)
        .json({ message: "User already like the post", status: "Failed" });
      return;
    } else {
      // Complete the like request
      try {
        postExist.likes.push({ user: userId as any });
        postExist.save();

        // Sending like notification to the user
        io.emit(
          "notification",
          `${userId} has just liked your post, ${postId}`
        );

        // Sending like feedback to the user through the client
        console.log({
          message: "Post was liked",
          status: "success",
          data: postExist,
        });
        res.status(200).json({
          message: "Post was liked",
          status: "success",
          data: postExist,
        });
      } catch (error) {
        console.log({
          message: "Like failed",
          status: "Failed",
          error: error,
        });
        res.status(500).json({
          message: "Like failed",
          status: "Failed",
          error: error,
        });
      }
    }
  } else {
    // Complete the like request
    const likePost = await comment_like_Model.create({
      post: postId,
      likes: { user: userId },
    });

    if (!likePost) {
      console.log({
        message: "Failed to like post",
        status: "Failed",
      });

      res.status(500).json({
        message: "Failed to like post",
        status: "Failed",
      });
      return;
    }

    // Sending like notification to the user
    io.emit("notification", `${userId} has just liked your post, ${postId}`);

    // Sending like feedback to the user through client
    console.log({
      message: "Post Liked",
      status: "success",
      data: likePost,
    });
    res.status(200).json({
      message: "Post Liked",
      status: "success",
      data: likePost,
    });
  }
};

const likeComment = async (req: SocketRequest, res: Response) => {
  const { commentId, userId, commentedUserId } = req.query;
  const io: Socket = req.socketIo;

  // checking if the commented user is thesame as the user about to like comment
  if (userId == commentedUserId) {
    console.log({ message: "User is not allowed to like his own comment", status: "Failed" });
    res.status(403).json({ message: "User is not allowed to like his own comment", status: "Failed" });
    return;
  }

    // checking if all variables needed for the requests are present
    if (!commentId || !userId || !commentedUserId) {
      console.log({ message: "Invalid request", status: "Failed" });
      res.status(400).json({ message: "Invalid request", status: "Failed" });
      return;
    }

  // Fetch the post that has the comment to like
  const commentedPost = await comment_like_Model.findOne({ "comments._id": commentId }).select('comments');

  //  if post found,
  if (commentedPost?.comments) {
    // select the comment records from the post records
    const commentToLike = commentedPost?.comments.find((item) => {
      return item.user as any == commentedUserId as any;
    });
    //  if selected, then update the comment record (like the comment)
    if (commentToLike) {
      const commentAlreadyLikedByUser = commentToLike?.likes.find((item) => {
        return item.user == userId as any;
      });

      if (commentAlreadyLikedByUser) {
        console.log({
          message: "User already like the comment",
          status: "Failed",
        });
        return res
          .status(403)
          .json({ message: "User already like the comment", status: "Failed" });
      }

      // Complete the like request
      if (!commentAlreadyLikedByUser) {

          const likeComment = await comment_like_Model.updateOne(
            { "comments._id": commentId }, // Find the document containing the subcomment with the given subCommentId
            { $addToSet: { "comments.$.likes": { user: userId } } } // Add the user to the likes array of the matched subcomment
          );
            
          if (likeComment) {
        // Sending like notification to the user
        io.emit(
          "notification",
          `${userId} has just liked your comment, ${commentId}`
        );

        // Sending like feedback to the user through the client
        console.log({
          message: "Comment was liked",
          status: "success",
          data: likeComment,
        });
        res.status(200).json({
          message: "Comment was liked",
          status: "success",
          data: likeComment,
        });
         
        }

        if (!likeComment) {
          console.log({
            message: "Like failed",
            status: "Failed",
            error: "",
          });
          res.status(500).json({
            message: "Like failed",
            status: "Failed",
            error: "",
          });
        }

      }

    } else {
      console.log({
        message: "No such comment to like",
        status: "Failed",
        error: "",
      });
      res.status(403).json({
        message: "No such comment to like",
        status: "Failed",
        error: "",
      });
    }

  }
};

const commentPerPost = async (req: Request, res: Response) => {
  const { postId } = req.query;

  // checking if all variables needed for the requests are present
  if (!postId) {
    console.log({ message: "Invalid request", status: "Failed" });
    res.status(400).json({ message: "Invalid request", status: "Failed" });
    return;
  }

  // if post already been commented by anyone
  const postExist = await comment_like_Model.findOne({ post: postId });

  // if no, inform the user
  if (!postExist) {
    console.log({ message: "Post not exist", status: "Failed" });
    res.status(404).json({ message: "Post not exist", status: "Failed" });
    return;
  }

  // if yes,
  if (postExist) {
    // compute the request and feedback to the client
    const commentPerPost = postExist.comments;
    const noOfComment = postExist.comments.length;
    console.log({
      message: "No of comment fetched",
      status: "success",
      data: { commentPerPost, noOfComment },
    });
    res.status(200).json({
      message: "No of comment fetched",
      status: "success",
      data: { commentPerPost, noOfComment },
    });
  }
};

const likePerPost = async (req: Request, res: Response) => {
  const { postId } = req.query;

  // checking if all variables needed for the requests are present
  if (!postId) {
    console.log({ message: "Invalid request", status: "Failed" });
    res.status(400).json({ message: "Invalid request", status: "Failed" });
    return;
  }

  // if post already been liked by anyone
  const postExist = await comment_like_Model.findOne({ post: postId });

  // if no, feed the user back
  if (!postExist) {
    console.log({ message: "Post not exist", status: "Failed" });
    res.status(404).json({ message: "Post not exist", status: "Failed" });
    return;
  }

  // if yes, compute like per post and send response back to the client
  if (postExist) {
    const likePerPost = postExist.likes;
    const noOfLike = postExist.likes.length;
    console.log({
      message: "No of likes fetched",
      status: "success",
      data: { likePerPost, noOfLike },
    });
    res.status(200).json({
      message: "No of likes fetched",
      status: "success",
      data: { likePerPost, noOfLike },
    });
  }
};

export { commentOnPost, likePost, commentPerPost, likePerPost, likeComment };
