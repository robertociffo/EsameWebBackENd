import request from "supertest";
require("chai").should();
import { app } from "../app";
import { Product } from "../models/Product";
import bcrypt from "bcrypt";
import { User as UserSchema } from "../models/User";
import { saltRounds } from "../routes/auth";
import jwt from "jsonwebtoken";
const jwtToken = "shhhhhhh";

const basicUrl = "/v1/products";

describe.only("products", () => {
  const product = {
    category: "furniture",
    subcategory: "tables",
    price: 1200,
    rank: "10",
    reviews: "nice"
  };
  const user = {
    name: "Oliver",
    surname: "Tree",
    email: "olivertree@gmail.com",
    password: "testtest",
  };
  let token: string;
  before(async () => {
    const userCreated = new UserSchema({
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: await bcrypt.hash(user.password, saltRounds),
    });
    await userCreated.save();
    token = jwt.sign(
      {
        id: userCreated._id,
        email: userCreated.email,
        name: userCreated.name,
        surname: userCreated.surname,
      },
      jwtToken
    );
    console.log("token:", token);
  });
  after(async () => {
    await UserSchema.findOneAndDelete({ email: user.email });
  });

  describe("create product", () => {
    let id: string;
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    it("failed test 401", async () => {
      const { status } = await request(app).post(basicUrl).send(product);
      status.should.be.equal(401);
    });
    it("success test 201", async () => {
      const { status, body } = await request(app)
        .post(basicUrl)
        .send(product)
        .set({ authorization: token });
      status.should.be.equal(201);
      body.should.have.property("_id");
      body.should.have.property("category").equal(product.category);
      body.should.have.property("subcategory").equal(product.subcategory);
      body.should.have.property("price").equal(product.price);
      body.should.have.property("rank").equal(product.rank);
      body.should.have.property("reviews").equal(product.reviews);
      id = body._id;
    });
  });


  describe("delete product", () => {
    let id: string;
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    it("test failed 401", async () => {
      const { status } = await request(app).delete(`${basicUrl}/${id}`);
      status.should.be.equal(401);
    });
    it("test success 200", async () => {
      const { status } = await request(app)
        .delete(`${basicUrl}/${id}`)
        .set({ authorization: token });
      status.should.be.equal(200);
    });
  });

  describe("get product", () => {
    let id: string;
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    it("test success 200", async () => {
      const { status, body } = await request(app).get(`${basicUrl}/${id}`);
      status.should.be.equal(200);
      body.should.have.property("_id").equal(id);
      body.should.have.property("category").equal(product.category);
      body.should.have.property("subcategory").equal(product.subcategory);
      body.should.have.property("price").equal(product.price);
      body.should.have.property("rank").equal(product.rank);
      body.should.have.property("reviews").equal(product.reviews);
    });
    it("test unsuccess 404 not valid mongoId", async () => {
      const fakeId = "a" + id.substring(1);
      const { status } = await request(app).get(`${basicUrl}/${fakeId}`);
      status.should.be.equal(404);
    });
  });

  describe("get products", () => {
    let ids: string[] = [];
    const products = [
      {
        category: "furniture",
        subcategory: "tables",
        price: 1200,
        rank: "10",
        reviews: "nice"
      },
      {
        category: "informatics",
        subcategory: "computers",
        price: 1300,
        rank: "9",
        reviews: "good"
      },
      {
        category: "home products",
        subcategory: "floor washer",
        price: 50,
        rank: "5",
        reviews: "not a good product"
      },
    ];
    before(async () => {
      const response = await Promise.all([
        Product.create(products[0]),
        Product.create(products[1]),
        Product.create(products[2]),
      ]);
      ids = response.map((item) => item._id.toString());
    });
    after(async () => {
      await Promise.all([
        Product.findByIdAndDelete(ids[0]),
        Product.findByIdAndDelete(ids[1]),
        Product.findByIdAndDelete(ids[2]),
      ]);
    });

    it("test success 200", async () => {
      const { status, body } = await request(app).get(basicUrl);
      status.should.be.equal(200);
      body.should.have.property("length").equal(products.length);
    });
  });

  describe("get products by category", () => {
    let ids: string[] = [];
    const products = [
      {
        category: "furniture",
        subcategory: "tables",
        price: 1200,
        rank: "10",
        reviews: "nice"
      },
      {
        category: "informatics",
        subcategory: "computers",
        price: 1300,
        rank: "9",
        reviews: "good"
      },
      {
        category: "home products",
        subcategory: "floor washer",
        price: 50,
        rank: "5",
        reviews: "not a good product"
      },
      {
        category: "furniture",
        subcategory: "chairs",
        price: 100,
        rank: "6",
        reviews: "Ok"
      },
    ];
    before(async () => {
      const response = await Promise.all([
        Product.create(products[0]),
        Product.create(products[1]),
        Product.create(products[2]),
      ]);
      ids = response.map((item) => item._id.toString());
    });
    after(async () => {
      await Promise.all([
        Product.findByIdAndDelete(ids[0]),
        Product.findByIdAndDelete(ids[1]),
        Product.findByIdAndDelete(ids[2]),
      ]);
    });

    it("test success 200 with query params", async () => {
      const { status, body } = await request(app).get(
        `${basicUrl}?category=furniture`
      );
      status.should.be.equal(200);
      body.should.have.property("length").equal(1);
    });
  });
  
});


