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
} from "./integration-test-helpers";
import Token from "../../src/models/token-model";

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

        const [gossip1, gossip2, gossip3] = await Promise.all([
          createGossip(testingUser.token, "1"),
          createGossip(testingUser.token, "2"),
          createGossip(controlUser.token, "3"),
        ]);

        const [comment1, comment2, comment3, comment4, comment5] =
          await Promise.all([
            createComment(testingUser.token, gossip1.id, "1"),
            createComment(testingUser.token, gossip3.id, "2"),
            createComment(controlUser.token, gossip1.id, "3"),
            createComment(controlUser.token, gossip3.id, "4"),
            createComment(controlUser.token, gossip2.id, "5"),
          ]);

        await Promise.all([
          likeItem(testingUser.token, gossip1.id, "Gossip"),
          likeItem(testingUser.token, gossip3.id, "Gossip"),
          likeItem(controlUser.token, gossip1.id, "Gossip"),
          likeItem(testingUser.token, comment1.id, "Comment"),
          likeItem(testingUser.token, comment2.id, "Comment"),
          likeItem(testingUser.token, comment3.id, "Comment"),
          likeItem(testingUser.token, comment4.id, "Comment"),
          likeItem(testingUser.token, comment5.id, "Comment"),
          likeItem(controlUser.token, comment1.id, "Comment"),
          likeItem(controlUser.token, comment2.id, "Comment"),
          likeItem(controlUser.token, comment3.id, "Comment"),
          likeItem(controlUser.token, comment5.id, "Comment"),
        ]);

        const likedCommentsIds = [comment1, comment2, comment3, comment5];

        const deleteRes = await request(app)
          .delete(`/users/delete/${testingUser.id}`)
          .set("Authorization", `Bearer ${testingUser.token}`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.OK_200);
        expect(deleteRes.body.message).toBe("Deleted");

        // check if user was deleted from db
        const isUserExist = await User.findById(testingUser.id);
        expect(isUserExist).toBeNull();

        // check if user's token deleted from db
        const isTokenExist = await Token.find({ userId: testingUser.id });
        expect(isTokenExist).toHaveLength(0);

        // check if gossip created by user were deleted from db
        const gossipsArr = await Gossip.find({ author: testingUser.id });
        expect(gossipsArr.length).toBe(0);

        // check if comments created by user were deleted from db
        const commentsArr = await Comment.find({ author: testingUser.id });
        expect(commentsArr.length).toBe(0);

        // check if comments on user's gossips were deleted from db
        const commentsOnUserGossips = await Comment.find({
          gossip: { $in: [gossip1.id, gossip2.id] },
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
