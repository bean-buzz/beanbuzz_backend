const mongoose = require("mongoose");

// Individual item in an order
const OrderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  size: { type: String, enum: ["small", "medium", "large"], required: false },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  specialInstructions: { type: String, required: false, trim: true },
});

// Full OrderSchema
const OrderSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: false },
    customerName: { type: String, required: true },
    // Array of ordered items
    items: [OrderItemSchema],
    // Sum of item prices
    totalPrice: { type: Number, required: true },
    // Order status
    orderStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    // Payment Status - Cash
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Online"],
      default: "Cash",
    },
    // Stores the unique identifier for cash payments
    cashTransferCode: {
      type: String,
      required: function () {
        return this.paymentMethod === "Cash";
      },
      // Make sure no duplicate codes are generated
      unique: true,
    },
    specialInstructions: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = {
  Order,
};
