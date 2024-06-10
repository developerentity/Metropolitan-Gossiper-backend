import request from "supertest";

import * as db from "../../src/config/db-tests";
import { app } from "../../src/app";
import { HTTP_STATUSES } from "../../src/http-statuses";

describe("GET - /users/get", () => {
  beforeAll(async () => {
    await db.connect();
  });
  afterEach(async () => {
    await db.clearDatabase();
  });
  afterAll(async () => {
    await db.closeDatabase();
  });

  it("should return empty users array", async () => {
    const res = await request(app).get("/users/get");

    const expectedResponse = {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      items: [],
    };

    expect(res.status).toBe(HTTP_STATUSES.OK_200);
    expect(res.body).toEqual(expect.objectContaining(expectedResponse));
  });
});
