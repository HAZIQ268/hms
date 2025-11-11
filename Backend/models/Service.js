const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    service_id: { type: Number, required: true },
    service_name: { type: String, required: true },
    details: { type: String },
    price: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);


// const mongoose = require("mongoose");

// const serviceSchema = new mongoose.Schema(
//   {
//     service_id: { type: Number, unique: true, required: true },
//     guest_id: { type: String, required: true },
//     service_type: {
//       type: String,
//       enum: ["room_service", "laundry", "spa", "cleaning"],
//       required: true,
//     },
//     price: { type: Number, default: 0 },
//     status: { type: String, enum: ["pending", "completed"], default: "pending" },
//     details: { type: String, default: "" },
//     request_time: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Service", serviceSchema);



