import request from "supertest";
import supertestAsPromised from "supertest-as-promised";

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

  it("should return 400 code http response and 6 errors", async () => {
    const res = await request(app).post("/account/auth/signup").send({});

    expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
    expect(res.body.errors.length).toEqual(6);
  });

  it("should create a new user and return tokens", async () => {
    const newUser = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
    };

    const res = await request(app).post("/account/auth/signup").send(newUser);

    expect(res.status).toBe(HTTP_STATUSES.OK_200);

    expect(res.body).toHaveProperty("registeredUser");
    expect(res.body.registeredUser.firstName).toBe(newUser.firstName);
    expect(res.body.registeredUser.lastName).toBe(newUser.lastName);
    expect(res.body.registeredUser.email).toBe(newUser.email);
    expect(res.body.registeredUser).toHaveProperty("createdAt");
    expect(res.body.registeredUser).toHaveProperty("id");

    expect(res.body).toHaveProperty("backendTokens");
    expect(res.body.backendTokens).toHaveProperty("accessToken");
    expect(res.body.backendTokens).toHaveProperty("refreshToken");
    expect(res.body.backendTokens).toHaveProperty("expiresIn");
  });

  it("should return 400 if email is already registered", async () => {
    const existedUser = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      password: "password123",
    };

    const requestWithPromise = supertestAsPromised(app);
    await requestWithPromise.post("/account/auth/signup").send(existedUser);

    const newUser = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      password: "password123",
    };

    const res = await request(app).post("/account/auth/signup").send(newUser);

    expect(res.status).toBe(HTTP_STATUSES.BAD_REQUEST_400);
    expect(res.body).toEqual({
      message: "User with such email already registered",
    });
  });
});
