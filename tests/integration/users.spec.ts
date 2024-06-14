import request from "supertest";

import * as db from "../../src/config/db-tests";
import { app } from "../../src/app";
import { HTTP_STATUSES } from "../../src/http-statuses";
import User from "../../src/models/user-model";
import Gossip from "../../src/models/gossip-model";
import Comment from "../../src/models/comment-model";
import {
  createUser,
  createGossip,
  createComment,
  likeItem,
  user1,
  user2,
} from "../test-helpers";

describe("Users route", () => {
  beforeAll(async () => {
    await db.connect();
  });
  afterEach(async () => {
    await db.clearDatabase();
  });
  afterAll(async () => {
    await db.closeDatabase();
  });

  describe("User reading", () => {
    describe("When data is valid", () => {
      it("should return users array with one entity ", async () => {
        const { id } = await createUser(user1);

        const res = await request(app).get("/users/get");
        expect(res.status).toBe(HTTP_STATUSES.OK_200);
        expect(res.body.totalItems).toBe(1);
        expect(res.body.totalPages).toBe(1);
        expect(res.body.currentPage).toBe(1);
        expect(res.body.items.length).toBe(1);
        expect(res.body.items[0].id).toBe(id);
      });
      it("should return one user", async () => {
        const { id } = await createUser(user1);

        const res = await request(app).get(`/users/get/${id}`);
        expect(res.status).toBe(HTTP_STATUSES.OK_200);
        expect(res.body.id).toBe(id);
        expect(res.body.email).toBe(user1.email);
      });
    });
    describe("When data is invalid", () => {});
  });

  describe("User deleting", () => {
    describe("When data is valid", () => {
      it("should delete user and all related data", async () => {
        const testingUser = await createUser(user1);
        const controlUser = await createUser(user2);

        const gossip1 = await createGossip(testingUser.token, "1");
        const gossip2 = await createGossip(testingUser.token, "2");
        const gossip3 = await createGossip(controlUser.token, "3");

        const comment1 = await createComment(testingUser.token, gossip1, "1");
        const comment2 = await createComment(testingUser.token, gossip3, "2");
        const comment3 = await createComment(controlUser.token, gossip1, "3");
        const comment4 = await createComment(controlUser.token, gossip3, "4");
        const comment5 = await createComment(controlUser.token, gossip2, "5");

        await likeItem(testingUser.token, gossip1, "Gossip");
        await likeItem(testingUser.token, gossip3, "Gossip");
        await likeItem(testingUser.token, comment1, "Comment");
        await likeItem(testingUser.token, comment2, "Comment");
        await likeItem(testingUser.token, comment3, "Comment");
        await likeItem(testingUser.token, comment4, "Comment");
        await likeItem(testingUser.token, comment5, "Comment");

        await likeItem(controlUser.token, gossip1, "Gossip");
        await likeItem(controlUser.token, comment1, "Comment");
        await likeItem(controlUser.token, comment2, "Comment");
        await likeItem(controlUser.token, comment3, "Comment");
        await likeItem(controlUser.token, comment5, "Comment");

        const gossipIds = [gossip1, gossip2];
        const likedCommentsIds = [comment1, comment2, comment3, comment5];

        const deleteRes = await request(app)
          .delete(`/users/delete/${testingUser.id}`)
          .set("Authorization", `Bearer ${testingUser.token}`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.OK_200);
        expect(deleteRes.body.message).toBe("Deleted");

        // check if user was deleted from db
        const isUserExist = await User.findById(testingUser.id);
        expect(isUserExist).toBeNull();

        // check if gossip created by user were deleted from db
        const gossipsArr = await Gossip.find({ author: testingUser.id });
        expect(gossipsArr.length).toBe(0);

        // check if comments created by user were deleted from db
        const commentsArr = await Comment.find({ author: testingUser.id });
        expect(commentsArr.length).toBe(0);

        // check if comments on user's gossips were deleted from db
        const commentsOnUserGossips = await Comment.find({
          gossip: { $in: gossipIds },
        });
        expect(commentsOnUserGossips.length).toBe(0);

        // check if likes were cleaned up in db
        const gossipsWithLikes = await Gossip.find({ likes: testingUser.id });
        expect(gossipsWithLikes.length).toBe(0);
        const commentsWithLikes = await Comment.find({ likes: testingUser.id });
        expect(commentsWithLikes.length).toBe(0);

        // Check if likedComments of other users do not contain IDs of deleted comments
        const controlUserFromDb = await User.findById(controlUser.id);
        for (const commentId of likedCommentsIds) {
          expect(controlUserFromDb!.likedComments).not.toContain(commentId);
        }
      });
    });
    describe("When data is invalid", () => {
      it("shouldn't delete user from users list without token", async () => {
        const { id } = await createUser(user1);

        const deleteRes = await request(app)
          .delete(`/users/delete/${id}`)
          .set("Authorization", `Bearer -wrong-token-`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.UNAUTHORIZED_401);

        const existenceRes = await request(app).get(`/users/get/${id}`);
        expect(existenceRes.status).toBe(HTTP_STATUSES.OK_200);
        expect(existenceRes.body.id).toBe(id);
      });
    });
  });
});
