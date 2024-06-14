import request from "supertest";

import { app } from "../../src/app";
import * as db from "../../src/config/db-tests";
import {
  createComment,
  createGossip,
  createUser,
  likeItem,
  user1,
  user2,
} from "../test-helpers";
import { HTTP_STATUSES } from "../../src/http-statuses";
import Gossip from "../../src/models/gossip-model";
import Comment from "../../src/models/comment-model";
import User from "../../src/models/user-model";

describe("Test request gossips route", () => {
  beforeAll(async () => {
    await db.connect();
  });
  afterEach(async () => {
    await db.clearDatabase();
  });
  afterAll(async () => {
    await db.closeDatabase();
  });

  describe("Gossip deleting", () => {
    describe("When data is valid", () => {
      it("should delete gossip and all related data ", async () => {
        const controlUser1 = await createUser(user1);
        const controlUser2 = await createUser(user2);

        const gossipId = await createGossip(controlUser1.token, "1");

        const commentId1 = await createComment(
          controlUser1.token,
          gossipId,
          "1"
        );
        const commentId2 = await createComment(
          controlUser2.token,
          gossipId,
          "2"
        );

        await likeItem(controlUser1.token, gossipId, "Gossip");
        await likeItem(controlUser1.token, commentId1, "Comment");
        await likeItem(controlUser1.token, commentId2, "Comment");

        await likeItem(controlUser2.token, gossipId, "Gossip");
        await likeItem(controlUser2.token, commentId1, "Comment");
        await likeItem(controlUser2.token, commentId2, "Comment");

        const deleteRes = await request(app)
          .delete(`/gossips/delete/${gossipId}`)
          .set("Authorization", `Bearer ${controlUser1.token}`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.OK_200);
        expect(deleteRes.body.message).toBe("Gossip deleted");

        // check if gossip was deleted from db
        const isGossipExist = await Gossip.findById(gossipId);
        expect(isGossipExist).toBeNull();

        // check that the remote gossip is missing
        // in the gossips array of the user controlUser1
        const updatedUser1 = await User.findById(controlUser1.id);
        expect(updatedUser1!.gossips).not.toContain(gossipId);

        // check that the comments to this gossip removed from the database
        const comments = await Comment.find({ gossip: gossipId });
        expect(comments.length).toBe(0);

        // check that likes on gossips and comments
        // removed from likedGossips and likedComments of all users
        const updatedControlUser2 = await User.findById(controlUser2.id);
        expect(updatedControlUser2!.likedGossips).not.toContain(gossipId);
        expect(updatedControlUser2!.likedComments).not.toContain(commentId1);
        expect(updatedControlUser2!.likedComments).not.toContain(commentId2);
      });
    });
    describe("When data is invalid", () => {
      it("should return  ", async () => {
        const controlUser1 = await createUser(user1);
        const gossipId = await createGossip(controlUser1.token, "1");

        const deleteRes = await request(app)
          .delete(`/gossips/delete/${gossipId}`)
          .set("Authorization", `Bearer -wrong-token-`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.UNAUTHORIZED_401);
      });
    });
  });

  test("GET - /gossips/get", async () => {
    // const res = await request.get("/gossips/get").send();
    // const body = res.body;
    // const message = body.message;
    // expect(res.statusCode).toBe(200);
  });
});
