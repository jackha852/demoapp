import db from "./db";
import getRouteDistance from "./googlemap";
import logger from "./logger";

const Order = db.orders;

const ORDER_STATUS = {
  UNASSIGNED: "UNASSIGNED",
  TAKEN: "TAKEN",
};

const ERROR_MSG = {
  SUCCESS: "SUCCESS",
  GOOGLE_MAP_API_ERROR: "Google map API error",
  ORDER_NOT_FOUND: "Order not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  INVALID_ORIGIN: "Invalid origin",
  INVALID_DESTINATION: "Invalid destination",
  INVALID_ORDER_ID: "Invalid order ID",
  INVALID_ORDER_STATUS: "Invalid order status",
  INVALID_QUERY_STRING: "Invalid query string",
  INVALID_PAGE: "Invalid page",
  INVALID_LIMIT: "Invalid limit",
};

export const placeOrder = async (req, res) => {
  const { origin, destination } = req.body;

  if (
    !Array.isArray(origin) ||
    origin.length !== 2 ||
    !origin.every((item) => typeof item === "string" && !isNaN(parseFloat(item)))
  ) {
    res.status(400).json({ error: ERROR_MSG.INVALID_ORIGIN });
    return;
  }

  if (
    !Array.isArray(destination) ||
    destination.length !== 2 ||
    !destination.every((item) => typeof item === "string" && !isNaN(parseFloat(item)))
  ) {
    res.status(400).json({ error: ERROR_MSG.INVALID_DESTINATION });
    return;
  }

  try {
    const distanceMeter = await getRouteDistance(origin, destination);
    const order = await Order.create({
      startLatitude: parseFloat(origin[0]),
      startLongitude: parseFloat(origin[1]),
      endLatitude: parseFloat(destination[0]),
      endLongitude: parseFloat(destination[1]),
      distanceMeter: Math.round(distanceMeter),
      status: ORDER_STATUS.UNASSIGNED,
    });

    res.status(200).json({ id: order.id, distance: order.distanceMeter, status: order.status });
  } catch (error) {
    logger.error(`Error placing order:`, error);
    res.status(500).json({ error: ERROR_MSG.INTERNAL_SERVER_ERROR });
  }
};

export const takeOrder = async (req, res) => {
  if (!req.params || !req.params.id || isNaN(parseInt(req.params.id))) {
    res.status(400).json({ error: ERROR_MSG.INVALID_ORDER_ID });
    return;
  }

  if (!req.body || !req.body.status || req.body.status !== ORDER_STATUS.TAKEN) {
    res.status(400).json({ error: ERROR_MSG.INVALID_ORDER_STATUS });
    return;
  }

  const orderId = parseInt(req.params.id);
  const transaction = await db.sequelize.transaction({
    isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      await transaction.rollback();
      res.status(404).json({ error: ERROR_MSG.ORDER_NOT_FOUND });
      return;
    }

    if (order.status !== ORDER_STATUS.UNASSIGNED) {
      await transaction.rollback();
      res.status(400).json({ error: ERROR_MSG.INVALID_ORDER_STATUS });
      return;
    }

    const updatedOrder = await Order.update(
      { status: req.body.status },
      { where: { id: orderId }, transaction }
    );

    if (updatedOrder[0] > 0) {
      await transaction.commit();
      res.status(200).json({ status: ERROR_MSG.SUCCESS });
    } else {
      await transaction.rollback();
      res.status(404).json({ error: ERROR_MSG.ORDER_NOT_FOUND });
    }
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    logger.error("Error taking order:", error);
    res.status(500).json({ error: ERROR_MSG.INTERNAL_SERVER_ERROR });
  }
};

export const getAllOrders = async (req, res) => {
  if (!req.query) {
    res.status(400).json({ error: ERROR_MSG.INVALID_QUERY_STRING });
    return;
  }

  if (!req.query.page || isNaN(parseInt(req.query.page)) || parseInt(req.query.page) < 1) {
    res.status(400).json({ error: ERROR_MSG.INVALID_PAGE });
    return;
  }

  if (req.query.limit) {
    if (isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) < 0) {
      res.status(400).json({ error: ERROR_MSG.INVALID_LIMIT });
      return;
    }
  }

  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    let orders = [];

    if (limit) {
      const offset = (page - 1) * limit;
      orders = await Order.findAll({ offset, limit, order: [["createdAt", "DESC"]] });
    } else {
      orders = await Order.findAll({ order: [["createdAt", "DESC"]] });
    }

    const result = orders.map((order) => ({
      id: order.id,
      distance: order.distanceMeter,
      status: order.status,
    }));

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error finding orders:", error);
    res.status(500).json({ error: ERROR_MSG.INTERNAL_SERVER_ERROR });
  }
};

export default { takeOrder, placeOrder, getAllOrders };
