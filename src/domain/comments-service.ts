import { IComment, ICommentModel } from "../models/comment-model";
import { CommentViewModel } from "../models/comments/comment-view-model";
import { commentsQueryRepo } from "../repositories/comments-query-repo";
import { commentsRepo } from "../repositories/comments-repo";
import { ItemsListViewModel } from "../types/response-types";

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
  async readComments(
    gossipId: string,
    queryParams: {
      page: number;
      limit: number;
    }
  ): Promise<ItemsListViewModel<CommentViewModel>> {
    const commentsData = await commentsQueryRepo.findCommentsByGossip(
      gossipId,
      queryParams.page,
      queryParams.limit
    );
    return {
      totalItems: commentsData.totalItems,
      totalPages: commentsData.totalPages,
      currentPage: commentsData.currentPage,
      items: await Promise.all(
        commentsData.items.map((comment) => this._transformToViewModel(comment))
      ),
    };
  },
  async _transformToViewModel(
    comment: ICommentModel
  ): Promise<CommentViewModel> {
    return {
      id: comment._id.toHexString(),
      content: comment.content,
      author: comment.author.toString(),
      likes: comment.likes,
      gossip: comment.gossip.toString(),
      parent: comment.parent?.toString() || null,
      createdAt: comment.createdAt,
    };
  },
};
