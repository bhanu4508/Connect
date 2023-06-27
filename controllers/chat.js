import { StatusCodes } from "http-status-codes";
import Chat from "../models/chat.js";
import User from "../models/user.js";

import {
  BadRequestError,
} from "../errors/index.js";

const getChat = async (req, res) => {

  const { userId } = req.body;

  if (!userId) {
    return res.send("No User Exists!");
  } 

    let chat = await Chat.find({
      $and: [
        { users: { $elemMatch: { $eq: req.user.id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "username avatar email fullName _id",
  });

  if (chat.length > 0) {
    res.send(chat[0]);
  } else {
    const createChat = await Chat.create({
      chatName: "sender",
      users: [req.user.id, userId],
    });

    const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
      "users",
      "-password"
    );

    res.status(StatusCodes.OK).json(fullChat);
  }
};

const getChats = async (req, res) => {
  const chat = await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
    .populate("users", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  const user = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "username avatar email fullName _id",
  });

  res.status(StatusCodes.OK).json(user);
};


export {
  getChat,
  getChats,
};
