import { Request, Response } from "express";

import Logging from "../library/Logging";
import { HTTP_STATUSES } from "../http-statuses";
import { gossipsRepo } from "../repositories/gossips-repo";
import { commentsService } from "../domain/comments-service";
import { commentsRepo } from "../repositories/comments-repo";

const createComment = async (req: Request, res: Response) => {
  const { content, parent } = req.body;
  const author = req.user._id;
  const { gossipId } = req.params;

  if (!author)
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ error: "Unauthorized" });

  try {
    const gossip = await gossipsRepo.findGossipById(gossipId);
    if (!gossip)
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });

    const createdComment = await commentsService.createComment(
      author,
      gossipId,
      content,
      parent
    );

    return res.status(HTTP_STATUSES.CREATED_201).json({ createdComment });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to create a comment." });
  }
};

const likeComment = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { commentId } = req.params;

  try {
    const comment = await commentsRepo.findCommentById(commentId);

    if (!comment) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Comment not found" });
    }

    if (comment.likes.includes(author)) {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: "This comment have already been liked" });
    }

    await commentsService.likeComment(author, commentId);

    return res.status(HTTP_STATUSES.OK_200).json({ message: "Liked" });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to like comment." });
  }
};

const unlikeComment = async (req: Request, res: Response) => {
  const author = req.user?._id;
  const { commentId } = req.params;

  try {
    const comment = await commentsRepo.findCommentById(commentId);

    if (!comment) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Comment not found" });
    }

    if (!comment.likes.includes(author)) {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: "This comment haven't liked yet" });
    }

    await commentsService.unlikeComment(author, commentId);

    return res
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "This comment is no more liked" });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to unlike comment. " });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { commentId } = req.params;

  try {
    const comment = await commentsRepo.findCommentById(commentId);

    if (!comment) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Comment not found" });
    }

    if (comment.author.toString() !== author.toString()) {
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    const deletedComment = await commentsService.deleteComment(commentId);

    return res
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "Comment deleted", comment: deletedComment });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to delete comment." });
  }
};

export default {
  createComment,
  likeComment,
  unlikeComment,
  deleteComment,
};
