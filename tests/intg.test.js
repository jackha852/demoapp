import "dotenv/config";
import request from "supertest";
import axios from "axios";

import db from "../src/db";
import app from "../src/app";

jest.mock("axios");

beforeAll(async () => {
  await db.sequelize.authenticate();
  await db.sequelize.sync({ force: false });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Integration Test - Place Order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new order with 200", async () => {
    axios.post.mockResolvedValueOnce({
      status: 200,
      statusText: "OK",
      data: {
        routes: [
          {
            distanceMeters: 772,
            duration: "165s",
            polyline: {
              encodedPolyline: "ipkcFfichVnP@j@BLoFVwM{E?",
            },
          },
        ],
      },
    });

    const req = { origin: ["11.01", "111.01"], destination: ["11.11", "111.11"] };
    const res = await request(app).post("/orders").send(req);

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(Number.isInteger(res.body.id)).toBe(true);
    expect(res.body.distance).toEqual(772);
    expect(res.body.status).toEqual("UNASSIGNED");
  });

  it("should fail as origin is missing with 400", async () => {
    const req = { destination: ["11.11", "111.11"] };
    const res = await request(app).post("/orders").send(req);

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ error: "Invalid origin" });
  });

  it("should fail as google api error with 500", async () => {
    axios.post.mockRejectedValueOnce(new Error("Bad Request"));

    const req = { origin: ["11.01", "111.01"], destination: ["11.11", "111.11"] };
    const res = await request(app).post("/orders").send(req);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(500);
    expect(res.body).toEqual({ error: "Internal server error" });
  });
});

describe("Integration Test - Take Order", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should take an existing order with 200", async () => {
    axios.post.mockResolvedValueOnce({
      status: 200,
      statusText: "OK",
      data: {
        routes: [
          {
            distanceMeters: 772,
            duration: "165s",
            polyline: {
              encodedPolyline: "ipkcFfichVnP@j@BLoFVwM{E?",
            },
          },
        ],
      },
    });

    const newOrderReq = { origin: ["11.01", "111.01"], destination: ["11.11", "111.11"] };
    const newOrderRes = await request(app).post("/orders").send(newOrderReq);
    const newOrderId = newOrderRes.body.id;

    const currOrderReq = { status: "TAKEN" };
    const currOrderRes = await request(app).patch(`/orders/${newOrderId}`).send(currOrderReq);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(currOrderRes.headers["content-type"]).toMatch(/json/);
    expect(currOrderRes.status).toEqual(200);
    expect(currOrderRes.body).toEqual({ status: "SUCCESS" });
  });

  it("should fail as id is NOT integer with 400", async () => {
    const req = { status: "TAKEN" };
    const res = await request(app).patch(`/orders/a`).send(req);

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ error: "Invalid order ID" });
  });

  it("should fail as id is NOT found with 404", async () => {
    const req = { status: "TAKEN" };
    const res = await request(app).patch(`/orders/9999999999`).send(req);

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(404);
    expect(res.body).toEqual({ error: "Order not found" });
  });
});

describe("Integration Test - Get Order List", () => {
  it("should get an order list with 200", async () => {
    const res = await request(app).get(`/orders?page=1&limit=3`);

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body.length).toBeLessThanOrEqual(3);
  });
});
