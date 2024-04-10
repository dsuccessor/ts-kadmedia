import { Request, Response, NextFunction } from "express";
import followerModel from "../models/followerModel";
import userModel, { User } from "../models/userModel";
import { SocketRequest } from "./postController";

const followUser = async (req: SocketRequest, res: Response, next: NextFunction) => {
  const { followerId, followId, fcmToken } = req?.query;
  const io = req?.socketIo;
  const admin = req?.fcmAdmin;

  // If the id of the first user (follower) and second user (followee) is not specified
  if (!followerId || !followId) {
    console?.log({ message: "Incomplete request", status: "Failed" });
    return res
      ?.status(400)
      ?.json({ message: "Incomplete request", status: "Failed" });
  }

  //  if the id for user that want to follow (first user) is thesame with the id of the user he wanted to follow (user two)
  if (followerId == followId) {
    console?.log({ message: "You can not follow yourself", status: "Failed" });
    return res
      ?.status(403)
      ?.json({ message: "You can not follow yourself", status: "Failed" });
  }

  // Check If first user already follow the second user
  const followerExist = await followerModel?.findOne({ user: followerId });
  const followIdExist = followerExist?.follows?.find((item) => {
    return item?.user == followId as any;
  });

  //If first user already follow the second user
  if (followerExist && followIdExist) {
    console?.log({ message: "Already a follower", status: "Failed" });
    return res
      ?.status(403)
      ?.json({ message: "Already a follower", status: "Failed" });
  }

  // Follow (update) operation & Follower operation Start
  //If first user had followed someone but not this second user 
  if (followerExist && !followIdExist) {

    // Follow (update)
    // add the second user to the list of the users the first user had followed
    const updateFollowsList = await followerModel.findOneAndUpdate({ user: followerId }, { $push: { follows: { user: followId } } }, { new: true })
    if (updateFollowsList) {
      // Check If second user already has the first user on the list of the user that followed him
      const followExist = await followerModel?.findOne({ user: followId });
      const followerIdExist = followExist?.followers?.find((item) => {
        return item?.user as any == followerId;
      });

      // Follower (update)
      // if second user did not have the first user on the list of users that had followed him
      if (followExist && !followerIdExist) {
        // add the first user to the list of the users following the second user
        const updateFollowersList = await followerModel.findOneAndUpdate({ user: followId }, { $push: { followers: { user: followerId } } }, { new: true })

        if (updateFollowersList) {
          console?.log({ message: "Follower Added", status: "Success" });
        }
        else {
          console?.log({ message: "Failed to add follower", status: "Failed" });
        }
      }

      // Follower (Create)
      //  if second user has not followed anyone nor anyone followed him
      if (!followExist) {
        // Add the first user as a follower of the second user
        const createFollower = await followerModel.create({
          user: followId,
          followers: { user: followerId },
        });

        if (createFollower) {
          console?.log({ message: "Follower Added", status: "Success" });
        }

        if (!createFollower) {
          console?.log({ message: "Failed to add Follower", status: "Failed" });
        }

      }

      io?.emit(
        "notification",
        `${followerId} has just followed your account ${followId}`
      );
      console.log("fcmToken", fcmToken);

      const message = {
        notification: {
          title: "New Follow Notification",
          body: `${followerId} just follow you`,
        },
        to: fcmToken
      }

      admin.send(message, (err: any, response: any) => {
        if (err) {
          console.log({ message: 'Push notification failed', status: 'failed', data: err });
        } else {
          console.log({ message: 'Push notification sent successfully', status: 'success', data: response });
        }
      })

      const followResult = await followerModel?.findOne({ user: followerId });
      console?.log({
        message: "Followed Successfull",
        data: followResult,
        status: "Success",
      });
      return res?.status(200)?.json({
        message: "Followed Successfull",
        data: followResult,
        status: "Success",
      });

    }
    else {
      console?.log({
        message: "Failed to follow user",
        status: "Failed",
        // error: err,
      });
      return res?.status(500)?.json({
        message: "Failed to follow user",
        status: "Failed",
        // error: err,
      });
    }

  }

  // Follow (Create) Operation & Follower Operation 2
  if (!followerExist) {
    const follow = await followerModel?.create({
      user: followerId,
      follows: { user: followId },
    });

    // Follower Operation 2
    if (follow) {
      const followExist = await followerModel?.findOne({ user: followId });
      const followerIdExist = followExist?.followers?.find((item) => {
        return item?.user == followerId as any;
      });

      // Follower (Update) Operation
      if (followExist && !followerIdExist) {
        const updateFollowersList = await followerModel.findOneAndUpdate({ user: followId }, { $push: { followers: { user: followerId } } }, { new: true })
        if (updateFollowersList) {
          console.log({ status: 'Success', message: 'Follower Added', data: updateFollowersList });

        }
        if (!updateFollowersList) {
          console.log({ status: 'Fsiled', message: 'Unable to add Follower', error: updateFollowersList });
        }
      }

      // Follower (create) Operation
      if (!followExist) {
        const follower = await followerModel.create({
          user: followId,
          followers: { user: followerId },
        });
        if (follower) {
          console.log({ status: 'Success', message: 'Follower Added', data: follower });
        }
        if (!follower) {
          console.log({ status: 'Failed', message: 'Unable to add Follower', error: follower });
        }
      }

      io?.emit(
        "notification",
        `${followerId} has just followed your account ${followId}`
      );

      // const fcmToken = await userModel.findById(followId).select('fcmtoken');
      // const {fcmToken, ...rest} = userDetails;
      console.log("fcmToken", fcmToken);

      const message = {
        notification: {
          title: "New Follow Notification",
          body: `${followerId} just follow you`,
        },
        to: fcmToken
      }

      admin.send(message, (err: any, response: any) => {
        if (err) {
          console.log({ message: 'Push notification failed', status: 'failed', data: err });
        } else {
          console.log({ message: 'Push notification sent successfully', status: 'success', data: response });
        }
      })

      console?.log({
        message: "Followed Successfull",
        data: follow,
        status: "Success",
      });
      return res?.status(200)?.json({
        message: "Followed Successfull",
        data: follow,
        status: "Success",
      });
    } else {
      console?.log({ message: "Follow attempt failed", status: "Failed" });
      return res
        ?.status(500)
        ?.json({ message: "Follow attempt failed", status: "Failed" });
    }

  }
};

const get_follows_followers = async (req: Request, res: Response) => {
  const { userId } = req?.query;

  if (!userId) {
    console?.log({ message: "Incomplete request", status: "Failed" });
    return res
      ?.status(400)
      ?.json({ message: "Incomplete request", status: "Failed" });
  }

  const getRecord = await followerModel.findOne({ user: userId });

  if (!getRecord) {
    console?.log({
      message: "User has no follower and has never follow anyone",
      status: "Failed",
    });
    return res?.status(404)?.json({
      message: "User has no follower and has never follow anyone",
      status: "Failed",
    });
  }

  if (getRecord) {
    const noOfFollows = getRecord.follows.length;
    const noOfFollowers = getRecord.followers.length;

    const result = {
      noOfFollows,
      noOfFollowers,
      data: getRecord,
    };

    console?.log({
      message: "Result fetched",
      data: result,
      status: "Success",
    });
    return res?.status(200)?.json({
      message: "Result fetched",
      result,
      status: "Success",
    });
  }
};

export { followUser, get_follows_followers };
