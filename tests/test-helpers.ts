import request from "supertest";
import { app } from "../src/app";
import { HTTP_STATUSES } from "../src/http-statuses";

export const user1 = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  password: "password123",
};
export const user2 = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  password: "password123",
};

export async function createUser(user: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{
  id: string;
  token: string;
  likedComments: string[];
  likedGossips: string[];
  gossips: string[];
}> {
  const response = await request(app).post("/account/auth/signup").send(user);
  const { id, likedGossips, likedComments, gossips } =
    response.body.registeredUser;
  const token = response.body.backendTokens.accessToken;
  return { id, token, likedGossips, likedComments, gossips };
}

export async function createGossip(
  token: string,
  text: string
): Promise<string> {
  const response = await request(app)
    .post("/gossips/create")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: text, content: text });

  return response.body.createdGossip.id;
}

export async function createComment(
  token: string,
  gossipId: string,
  text: string
): Promise<string> {
  const response = await request(app)
    .post(`/gossips/create/${gossipId}/comment`)
    .set("Authorization", `Bearer ${token}`)
    .send({ content: text });
  return response.body.createdComment.id;
}

export async function likeItem(
  token: string,
  itemId: string,
  itemType: "Comment" | "Gossip"
): Promise<boolean> {
  const response = await request(app)
    .post(`/likes/${itemId}/like?itemType=${itemType}`)
    .set("Authorization", `Bearer ${token}`);
  return response.status === HTTP_STATUSES.OK_200;
}
