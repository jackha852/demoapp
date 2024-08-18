import "dotenv/config";
import axios from "axios";

import db from "../src/db";
import { placeOrder, takeOrder, getAllOrders } from "../src/service";

jest.mock("axios");

beforeAll(async () => {
  await db.sequelize.authenticate();
  await db.sequelize.sync({ force: false });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Unit Test - Place Order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should place a new order", async () => {
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

    const req = {
      body: {
        origin: ["11.01", "111.01"],
        destination: ["11.11", "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json.mock.calls[0][0].id).toBeGreaterThan(0);
    expect(mockRes.json.mock.calls[0][0].distance).toEqual(772);
    expect(mockRes.json.mock.calls[0][0].status).toEqual("UNASSIGNED");
  });

  it("should fail as origin is missing", async () => {
    const req = {
      body: {
        destination: ["11.11", "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid origin" });
  });

  it("should fail as origin is NOT array", async () => {
    const req = {
      body: {
        origin: "a",
        destination: ["11.11", "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid origin" });
  });

  it("should fail as origin is NOT array of length 2", async () => {
    const req = {
      body: {
        origin: ["11.01"],
        destination: ["11.11", "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid origin" });
  });

  it("should fail as origin is NOT array of strings", async () => {
    const req = {
      body: {
        origin: [11.01, "111.01"],
        destination: ["11.11", "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid origin" });
  });

  it("should fail as origin is NOT array of string numbers", async () => {
    const req = {
      body: {
        origin: ["a", "111.01"],
        destination: ["11.11", "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid origin" });
  });

  it("should fail as destination is missing", async () => {
    const req = {
      body: {
        origin: ["11.01", "111.01"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid destination" });
  });

  it("should fail as destination is NOT array", async () => {
    const req = {
      body: {
        origin: ["11.01", "111.01"],
        destination: "a",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid destination" });
  });

  it("should fail as destination is NOT array of length 2", async () => {
    const req = {
      body: {
        origin: ["11.01", "111.01"],
        destination: ["11.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid destination" });
  });

  it("should fail as destination is NOT array of strings", async () => {
    const req = {
      body: {
        origin: ["11.01", "111.01"],
        destination: [11.11, "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid destination" });
  });

  it("should fail as destination is NOT array of string numbers", async () => {
    const req = {
      body: {
        origin: ["11.01", "111.01"],
        destination: ["a", "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid destination" });
  });

  it("should fail as google api returns 400", async () => {
    axios.post.mockRejectedValueOnce(new Error("Bad Request"));

    const req = {
      body: {
        origin: ["11.01", "111.01"],
        destination: ["11.11", "111.11"],
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await placeOrder(req, mockRes);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});

describe("Unit Test - Take Order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should take an existing order", async () => {
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

    const newOrderReq = {
      body: {
        origin: ["11.01", "111.01"],
        destination: ["11.11", "111.11"],
      },
    };
    const newOrderMockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    await placeOrder(newOrderReq, newOrderMockRes);
    const newOrderId = newOrderMockRes.json.mock.calls[0][0].id;

    const currOrderReq = {
      params: { id: newOrderId },
      body: { status: "TAKEN" },
    };
    const currOrderMockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await takeOrder(currOrderReq, currOrderMockRes);

    expect(currOrderMockRes.status).toHaveBeenCalledWith(200);
    expect(currOrderMockRes.json).toHaveBeenCalledTimes(1);
    expect(currOrderMockRes.json).toHaveBeenCalledWith({ status: "SUCCESS" });
  });

  it("should fail as params is missing", async () => {
    const req = {
      body: { status: "TAKEN" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await takeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid order ID" });
  });

  it("should fail as id is missing", async () => {
    const req = {
      params: {},
      body: { status: "TAKEN" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await takeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid order ID" });
  });

  it("should fail as id is NOT integer", async () => {
    const req = {
      params: { id: "a" },
      body: { status: "TAKEN" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await takeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid order ID" });
  });

  it("should fail as body is missing", async () => {
    const req = {
      params: { id: 1 },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await takeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid order status" });
  });

  it("should fail as status is missing", async () => {
    const req = {
      params: { id: 1 },
      body: {},
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await takeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid order status" });
  });

  it("should fail as status is NOT 'TAKEN'", async () => {
    const req = {
      params: { id: 1 },
      body: { status: "a" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await takeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid order status" });
  });

  it("should fail as id is NOT found'", async () => {
    const req = {
      params: { id: 99999999 },
      body: { status: "TAKEN" },
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await takeOrder(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Order not found" });
  });
});

describe("Unit Test - Get Order List", () => {
  it("should get an order list with page & limit", async () => {
    const req = { query: { page: 1, limit: 3 } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getAllOrders(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json.mock.calls[0][0].length).toBeLessThanOrEqual(3);
  });

  it("should get an order list with page only", async () => {
    const req = { query: { page: 1 } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getAllOrders(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json.mock.calls[0][0].length).toBeGreaterThanOrEqual(0);
  });

  it("should fail as query string is missing", async () => {
    const req = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getAllOrders(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid query string" });
  });

  it("should fail as page is missing", async () => {
    const req = { query: { limit: 3 } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getAllOrders(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid page" });
  });

  it("should fail as page is NOT integer", async () => {
    const req = { query: { page: "a", limit: 3 } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getAllOrders(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid page" });
  });

  it("should fail as page is less than 1", async () => {
    const req = { query: { page: 0, limit: 3 } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getAllOrders(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid page" });
  });

  it("should fail as limit is NOT integer", async () => {
    const req = { query: { page: 1, limit: "a" } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getAllOrders(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid limit" });
  });

  it("should fail as limit is less than 0", async () => {
    const req = { query: { page: 1, limit: -1 } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };

    await getAllOrders(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid limit" });
  });
});
