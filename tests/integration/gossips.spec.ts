import request from "supertest";

import { app } from "../../src/app";
import * as db from "../../src/config/db-tests";
import {
  ControlUserType,
  createComment,
  createGossip,
  createUser,
  likeItem,
  user1,
  user2,
} from "./integration-test-helpers";
import { HTTP_STATUSES } from "../../src/http-statuses";
import Gossip from "../../src/models/gossip-model";
import Comment from "../../src/models/comment-model";
import User from "../../src/models/user-model";

describe("Test request gossips route", () => {
  let controlUser1: ControlUserType, controlUser2: ControlUserType;
  beforeAll(async () => {
    await db.connect();
    controlUser1 = await createUser(user1);
    controlUser2 = await createUser(user2);
  });
  afterAll(async () => {
    await db.clearDatabase();
    await db.closeDatabase();
  });

  describe("Gossip deleting", () => {
    describe("When data is valid", () => {
      it("should delete gossip and all related data ", async () => {
        const gossip = await createGossip(controlUser1.token, "1");

        const [comment1, comment2] = await Promise.all([
          createComment(controlUser1.token, gossip.id, "1"),
          createComment(controlUser2.token, gossip.id, "2"),
        ]);

        await Promise.all([
          likeItem(controlUser1.token, gossip.id, "Gossip"),
          likeItem(controlUser1.token, comment1.id, "Comment"),
          likeItem(controlUser1.token, comment2.id, "Comment"),
          likeItem(controlUser2.token, gossip.id, "Gossip"),
          likeItem(controlUser2.token, comment1.id, "Comment"),
          likeItem(controlUser2.token, comment2.id, "Comment"),
        ]);

        const deleteRes = await request(app)
          .delete(`/gossips/delete/${gossip.id}`)
          .set("Authorization", `Bearer ${controlUser1.token}`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.OK_200);
        expect(deleteRes.body.message).toBe("Gossip deleted");

        // check if gossip was deleted from db
        const isGossipExist = await Gossip.findById(gossip.id);
        expect(isGossipExist).toBeNull();

        // check that the remote gossip is missing
        // in the gossips array of the user controlUser1
        const updatedUser1 = await User.findById(controlUser1.id);
        expect(updatedUser1!.gossips).not.toContain(gossip.id);

        // check that the comments to this gossip removed from the database
        const comments = await Comment.find({ gossip: gossip.id });
        expect(comments.length).toBe(0);

        // check that likes on gossips and comments
        // removed from likedGossips and likedComments of all users
        const updatedControlUser2 = await User.findById(controlUser2.id);
        expect(updatedControlUser2!.likedGossips).not.toContain(gossip.id);
        expect(updatedControlUser2!.likedComments).not.toContain(comment1.id);
        expect(updatedControlUser2!.likedComments).not.toContain(comment2.id);
      });
    });
    describe("When data is invalid", () => {
      it("should return 401 http status", async () => {
        const gossip = await createGossip(controlUser1.token, "1");

        const deleteRes = await request(app)
          .delete(`/gossips/delete/${gossip.id}`)
          .set("Authorization", `Bearer -wrong-token-`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.UNAUTHORIZED_401);
      });
    });
  });

  describe("Comment deleting", () => {
    describe("When data is valid", () => {
      it("should delete comment and all related data ", async () => {
        const gossip = await createGossip(controlUser1.token, "1");
        const comment = await createComment(controlUser1.token, gossip.id, "1");
        await likeItem(controlUser1.token, comment.id, "Comment");

        const deleteRes = await request(app)
          .delete(`/gossips/delete/comment/${comment.id}`)
          .set("Authorization", `Bearer ${controlUser1.token}`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.OK_200);
        expect(deleteRes.body.message).toBe("Comment deleted");

        // check if comment was deleted from db
        const isCommentExist = await Comment.findById(comment.id);
        expect(isCommentExist).toBeNull();

        // check if all related data was removed from user entity
        const updatedUser = await User.findById(controlUser1.id);
        expect(updatedUser!.comments).not.toContain(comment.id);
        expect(updatedUser!.likedComments).not.toContain(comment.id);

        // check if all related data was removed from gossip entity
        const updatedGossip = await Gossip.findById(gossip.id);
        expect(updatedGossip?.comments).not.toContain(comment.id);
      });
    });
    describe("When data is invalid", () => {
      it("should return 401 http status", async () => {
        const gossip = await createGossip(controlUser1.token, "1");
        const comment = await createComment(controlUser2.token, gossip.id, "1");

        const deleteRes = await request(app)
          .delete(`/gossips/delete/comment/${comment.id}`)
          .set("Authorization", `Bearer -wrong-token-`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.UNAUTHORIZED_401);
      });
    });
  });
});
