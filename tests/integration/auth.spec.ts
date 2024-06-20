import request from "supertest";

import * as db from "../../src/config/db-tests";
import { app } from "../../src/app";
import { HTTP_STATUSES } from "../../src/http-statuses";

describe("POST - /account/auth/signup", () => {
  beforeAll(async () => {
    await db.connect();
  });
  afterEach(async () => {
    await db.clearDatabase();
  });
  afterAll(async () => {
    await db.closeDatabase();
  });
  describe("When data is valid", () => {
    it("should create a new user and return tokens", async () => {
      const res = await request(app).post("/account/auth/signup").send(user1);

      expect(res.status).toBe(HTTP_STATUSES.OK_200);

      expect(res.body).toHaveProperty("registeredUser");
      expect(res.body.registeredUser.firstName).toBe(user1.firstName);
      expect(res.body.registeredUser.lastName).toBe(user1.lastName);
      expect(res.body.registeredUser.email).toBe(user1.email);
      expect(res.body.registeredUser).toHaveProperty("createdAt");
      expect(res.body.registeredUser).toHaveProperty("id");

      expect(res.body).toHaveProperty("backendTokens");
      expect(res.body.backendTokens).toHaveProperty("accessToken");
      expect(res.body.backendTokens).toHaveProperty("refreshToken");
      expect(res.body.backendTokens).toHaveProperty("expiresIn");
    });
  });

  describe("When data is invalid", () => {
    it("should return 400 code http response and 6 errors", async () => {
      const res = await request(app).post("/account/auth/signup").send({});

      expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
      expect(res.body.errors.length).toEqual(8);
    });

    it("should return 400 if email is already registered", async () => {
      await request(app).post("/account/auth/signup").send(user1);
      const res = await request(app).post("/account/auth/signup").send(user2);

      expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
      expect(res.body.errors[0].msg).toBe(
        "User with such email already registered"
      );
    });
  });
});

const user1 = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  password: "password123",
};

const user2 = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  password: "password123",
};
