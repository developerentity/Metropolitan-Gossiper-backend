import { app } from "../../src/app";
import * as db from "../../src/config/db-tests";
import supertest from "supertest";
const request = supertest(app);

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

  test("GET - /gossips/get", async () => {
    const res = await request.get("/gossips/get").send();
    const body = res.body;
    const message = body.message;
    expect(res.statusCode).toBe(200);
  });
});
