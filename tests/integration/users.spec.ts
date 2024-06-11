import request from "supertest";

import * as db from "../../src/config/db-tests";
import { app } from "../../src/app";
import { HTTP_STATUSES } from "../../src/http-statuses";
import supertestAsPromised from "supertest-as-promised";

const requestWithPromise = supertestAsPromised(app);

const user1 = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  password: "password123",
};

const user2 = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  password: "password123",
};

async function createUser(user: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const response = await requestWithPromise
    .post("/account/auth/signup")
    .send(user);
  const userId = response.body.registeredUser.id;
  const accessToken = response.body.backendTokens.accessToken;
  return { userId, accessToken };
}

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
        const { userId } = await createUser(user1);

        const res = await request(app).get("/users/get");
        expect(res.status).toBe(HTTP_STATUSES.OK_200);
        expect(res.body.totalItems).toBe(1);
        expect(res.body.totalPages).toBe(1);
        expect(res.body.currentPage).toBe(1);
        expect(res.body.items.length).toBe(1);
        expect(res.body.items[0].id).toBe(userId);
      });
      it("should return one user", async () => {
        const { userId } = await createUser(user1);

        const res = await request(app).get(`/users/get/${userId}`);
        expect(res.status).toBe(HTTP_STATUSES.OK_200);
        expect(res.body.id).toBe(userId);
        expect(res.body.email).toBe(user1.email);
      });
    });
    describe("When data is invalid", () => {});
  });

  describe("User deleting", () => {
    describe("When data is valid", () => {
      it("should delete user from users list", async () => {
        const { userId, accessToken } = await createUser(user1);

        const deleteRes = await request(app)
          .delete(`/users/delete/${userId}`)
          .set("Authorization", `Bearer ${accessToken}`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.OK_200);
        expect(deleteRes.body.message).toBe("Deleted");

        const existenceRes = await request(app).get(`/users/get/${userId}`);
        expect(existenceRes.status).toBe(HTTP_STATUSES.NOT_FOUND_404);
        expect(existenceRes.body.message).toBe("User not found");
      });
    });
    describe("When data is invalid", () => {
      it("shouldn't delete user from users list without token", async () => {
        const { userId } = await createUser(user1);

        const deleteRes = await request(app)
          .delete(`/users/delete/${userId}`)
          .set("Authorization", `Bearer -wrong-token-`);
        expect(deleteRes.status).toBe(HTTP_STATUSES.UNAUTHORIZED_401);

        const existenceRes = await request(app).get(`/users/get/${userId}`);
        expect(existenceRes.status).toBe(HTTP_STATUSES.OK_200);
        expect(existenceRes.body.id).toBe(userId);
      });
    });
  });
});
