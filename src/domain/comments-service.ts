import { IComment, ICommentModel } from "../models/comment-model";
import { commentsRepo } from "../repositories/comments-repo";

/**
 *  This is a BLL (Business Logic Layer).
 *  Which most commonly responsible for CUD operations (CRUD without Read).
 */
export const commentsService = {
  async createComment(
    author: string,
    gossipId: string,
    content: string,
    parent: string | null
  ): Promise<ICommentModel | null> {
    let authenticParent = parent || null;

    if (parent) {
      const parentData: ICommentModel | null =
        await commentsRepo.findCommentById(parent);
      if (parentData?.parent) {
        authenticParent = parentData.parent;
      }
    }

    const comment: IComment = {
      author,
      content,
      gossip: gossipId,
      parent: authenticParent,
      likes: [],
    };

    return commentsRepo.createAndAssociateWithUserAndGossip(comment);
  },
  async likeComment(
    author: string,
    commentId: string
  ): Promise<string[] | null> {
    return commentsRepo.likeComment(author, commentId);
  },
  async unlikeComment(
    author: string,
    commentId: string
  ): Promise<string[] | null> {
    return commentsRepo.unlikeComment(author, commentId);
  },
  async deleteComment(commentId: string): Promise<ICommentModel | null> {
    return commentsRepo.deleteAndDissociateFromUserAndGossip(commentId);
  },
};
