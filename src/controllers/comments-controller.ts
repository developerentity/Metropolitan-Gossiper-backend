import { Request, Response } from "express";
import User from "../models/user-model";
import Gossip from "../models/gossip-model";
import Comment, { ICommentModel } from "../models/comment-model";
import { IGossipModel } from "../models/gossip-model";
import { HTTP_STATUSES } from "../http-statuses";

const createComment = async (req: Request, res: Response) => {
  const { content, parent } = req.body;
  const author = req.user._id;
  const { gossipId } = req.params;

  if (!author)
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ error: "Unauthorized" });

  const comment = new Comment({
    author,
    content,
    gossip: gossipId,
    parent: parent || null,
  });

  try {
    const gossip: IGossipModel | null = await Gossip.findById(gossipId);
    if (!gossip)
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });

    const createdComment = await comment.save();
    const commentedGossip = await Gossip.findByIdAndUpdate(gossip, {
      $push: { comments: createdComment._id },
    });
    const commentAuthor = await User.findByIdAndUpdate(author, {
      $push: { comments: createdComment._id },
    });
    return res.sendStatus(HTTP_STATUSES.CREATED_201);
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { commentId } = req.params;

  try {
    const comment: ICommentModel | null = await Comment.findById(commentId);

    if (!comment) {
      res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Comment not found" });
    } else {
      if (comment.author.toString() !== author.toString()) {
        return res
          .status(HTTP_STATUSES.FORBIDDEN_403)
          .json({ message: "You are not authorized to delete this comment" });
      }

      const deletedComment = await Comment.findByIdAndDelete(commentId);
      const clearedGossip = await Gossip.findByIdAndUpdate(comment.gossip, {
        $pull: { comments: commentId },
      });
      const clearedAuthor = await User.findByIdAndUpdate(author, {
        $pull: { comments: commentId },
      });

      res.status(HTTP_STATUSES.OK_200).json({ message: "Comment deleted" });
    }
  } catch (error) {
    res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

export default {
  createComment,
  deleteComment,
};
