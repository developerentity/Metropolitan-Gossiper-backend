// import request from "supertest";
// import { app } from "../../src/app";
// import { CreateProductModel } from "../../src/models/products/CreateProductModel";
// import { UpdateProductModel } from "../../src/models/products/UpdateProductModel";
// import { HTTP_STATUSES } from "../../src/http_statuses";
// import { ProductViewModel } from "../../src/models/products/ProductViewModel";

// describe("/products", () => {
//   beforeAll(async () => {
//     await request(app).delete("/__test__/products");
//   });

//   it("should return 200 and empty array", async () => {
//     await request(app).get("/products").expect(HTTP_STATUSES.OK_200, []);
//   });

//   it("should return 404 for not existing product", async () => {
//     await request(app)
//       .get("/products/444444444")
//       .expect(HTTP_STATUSES.NOT_FOUND_404);
//   });

//   it(`shouldn't create product with incorrect input data`, async () => {
//     const data: CreateProductModel = { title: "" };

//     await request(app)
//       .post("/products")
//       .send(data)
//       .expect(HTTP_STATUSES.BAD_REQUEST_400);

//     await request(app).get("/products").expect(HTTP_STATUSES.OK_200, []);
//   });

//   let createdProduct1: ProductViewModel;
//   let createdProduct2: ProductViewModel;
//   it(`should create product with correct input data`, async () => {
//     const data: CreateProductModel = { title: "new post" };
//     const createResponse = await request(app)
//       .post("/products")
//       .send(data)
//       .expect(HTTP_STATUSES.CREATED_201);

//     createdProduct1 = createResponse.body;

//     expect(createdProduct1).toEqual({
//       id: expect.any(Number),
//       title: data.title,
//     });

//     await request(app)
//       .get("/products")
//       .expect(HTTP_STATUSES.OK_200, [createdProduct1]);
//   });

//   it(`should create one more product`, async () => {
//     const data: CreateProductModel = { title: "new post 2" };
//     const createResponse = await request(app)
//       .post("/products")
//       .send(data)
//       .expect(HTTP_STATUSES.CREATED_201);

//     createdProduct2 = createResponse.body;

//     expect(createdProduct2).toEqual({
//       id: expect.any(Number),
//       title: data.title,
//     });

//     await request(app)
//       .get("/products")
//       .expect(HTTP_STATUSES.OK_200, [createdProduct1, createdProduct2]);
//   });

//   it(`shouldn't update product with incorrect input data`, async () => {
//     const data: CreateProductModel = { title: "" };

//     await request(app)
//       .put("/products/" + createdProduct1.id)
//       .send(data)
//       .expect(HTTP_STATUSES.BAD_REQUEST_400);

//     await request(app)
//       .get("/products/" + createdProduct1.id)
//       .expect(HTTP_STATUSES.OK_200, createdProduct1);
//   });

//   it(`shouldn't update product that doesn't exist`, async () => {
//     await request(app)
//       .put("/products/" + 2)
//       .send({ title: "bla bla" })
//       .expect(HTTP_STATUSES.NOT_FOUND_404);
//   });

//   it(`should update product with correct input data`, async () => {
//     const data: UpdateProductModel = { title: "Updated" };

//     const createResponse = await request(app)
//       .put("/products/" + createdProduct1.id)
//       .send(data)
//       .expect(HTTP_STATUSES.OK_200, {
//         ...createdProduct1,
//         title: data.title,
//       });

//     const updatedProduct = createResponse.body;

//     expect(updatedProduct).toEqual({
//       id: createdProduct1.id,
//       title: data.title,
//     });

//     await request(app)
//       .get("/products/" + createdProduct1.id)
//       .expect(HTTP_STATUSES.OK_200, {
//         ...createdProduct1,
//         title: data.title,
//       });

//     await request(app)
//       .get("/products/" + createdProduct2.id)
//       .expect(HTTP_STATUSES.OK_200, createdProduct2);
//   });

//   it("should delete both products", async () => {
//     await request(app)
//       .delete("/products/" + createdProduct1.id)
//       .expect(HTTP_STATUSES.NO_CONTENT_204);

//     await request(app)
//       .get("/products/" + createdProduct1.id)
//       .expect(HTTP_STATUSES.NOT_FOUND_404);

//     await request(app)
//       .delete("/products/" + createdProduct2.id)
//       .expect(HTTP_STATUSES.NO_CONTENT_204);

//     await request(app)
//       .get("/products/" + createdProduct2.id)
//       .expect(HTTP_STATUSES.NOT_FOUND_404);

//     await request(app).get("/products").expect(HTTP_STATUSES.OK_200, []);
//   });
// });
