const mongoose = require("mongoose");
const Counter = require("./Counter");

const billSchema = new mongoose.Schema(
  {
    bill_id: { type: String, unique: true },
    booking_id: { type: Number, required: true },
    guest_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room_charges: { type: Number, default: 0 },
    service_charges: { type: Number, default: 0 },
    total: { type: Number, required: true },
    payment_status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Auto-generate bill_id like BILL-021
billSchema.pre("save", async function (next) {
  if (this.bill_id) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "bill_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.bill_id = `BILL-${String(counter.seq).padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Bill", billSchema);
