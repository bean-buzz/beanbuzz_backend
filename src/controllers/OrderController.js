const express = require("express");
const crypto = require("crypto");

const { MenuItem } = require("../models/MenuModel");
const { Order } = require("../models/OrderModel");

const { isStaff } = require("../middleware/validateUser");

const router = express.Router();

// Function to generate a cash transfer code
// This will be used to fetch cash orders and whether they've been paid
function generateCashTransferCode(tableNumber) {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const randomString = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CTR-${date}-${tableNumber || "N/A"}-${randomString}`;
}

// POST - /order
// Allow the user to create an order
router.post("/", async (req, res) => {
  try {
    const {
      tableNumber,
      customerName,
      items,
      specialInstructions,
      paymentMethod = "Cash",
    } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Customer name and items are required." });
    }

    // Calculate the total price and validate items
    let totalPrice = 0;
    // Loop items inside the order array
    for (const item of items) {
      // Find the current item
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res
          .status(404)
          .json({ message: `Menu item with ID ${item.menuItem} not found.` });
      }

      // Check if size is valid
      if (menuItem.multipleSizes) {
        if (!menuItem.sizes[item.size]) {
          return res.status(400).json({
            message: `Invalid size ${item.size} for menu item ${menuItem.itemName}.`,
          });
        }
        // Calculate price for size
        item.price = menuItem.sizes[item.size].price * item.quantity;
      } else {
        // Use default price
        item.price = menuItem.defaultPrice * item.quantity;
      }

      totalPrice += item.price;
    }

    // Generate cashTransferCode if payment method is Cash
    let cashTransferCode = null;
    if (paymentMethod === "Cash") {
      cashTransferCode = generateCashTransferCode(tableNumber);
    }

    // Create and save the order
    const order = new Order({
      tableNumber,
      customerName,
      items,
      totalPrice,
      specialInstructions,
      paymentMethod,
      cashTransferCode,
    });

    // Save order to db
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - /order
/*  Allow staff/admin to view all orders
    This endpoint can use a bunch params
    If no params are used, this will display all orders
*/
router.get("/", isStaff, async (req, res) => {
  try {
    const {
      orderStatus,
      paymentStatus,
      paymentMethod,
      customerName,
      tableNumber,
    } = req.query;

    // Filter object based on query params
    const filter = {};
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      filter.orderStatus = paymentStatus;
    }

    if (paymentMethod) {
      filter.orderStatus = paymentMethod;
    }

    if (customerName) {
      filter.customerName = customerName;
    }

    if (tableNumber) {
      filter.tableNumber = tableNumber;
    }

    const orders = await Order.find(filter);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - /order/:id
// Allow the user or staff to retrieve order by id
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
