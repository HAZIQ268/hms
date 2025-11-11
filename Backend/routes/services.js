const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// ✅ Create a new service (auto ID)
router.post("/", async (req, res) => {
  try {
    const count = await Service.countDocuments();
    const newService = new Service({
      service_id: count + 1,
      service_name: req.body.service_name,
      details: req.body.details,
      price: req.body.price,
      status: req.body.status || "active",
    });

    const saved = await newService.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating service", error: err.message });
  }
});

// ✅ Get all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update service
router.put("/:id", async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Service not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete service
router.delete("/:id", async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const Service = require("../models/Service");

// // ✅ Price list for predefined services
// const SERVICE_PRICES = {
//   room_service: 1000,
//   laundry: 500,
//   spa: 2500,
//   cleaning: 700,
// };

// // ✅ Create new service (auto ID, auto price)
// router.post("/", async (req, res) => {
//   try {
//     const count = await Service.countDocuments();
//     const price = SERVICE_PRICES[req.body.service_type] || 0;

//     const newService = new Service({
//       service_id: count + 1,
//       guest_id: req.body.guest_id,
//       service_type: req.body.service_type,
//       details: req.body.details,
//       status: req.body.status || "pending",
//       price,
//     });

//     const saved = await newService.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating service", error: err.message });
//   }
// });

// // ✅ Get all services
// router.get("/", async (req, res) => {
//   try {
//     const services = await Service.find().sort({ createdAt: -1 });
//     res.json(services);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ✅ Update service
// router.put("/:id", async (req, res) => {
//   try {
//     const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updated) return res.status(404).json({ message: "Service not found" });
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ✅ Delete service
// router.delete("/:id", async (req, res) => {
//   try {
//     await Service.findByIdAndDelete(req.params.id);
//     res.json({ message: "Service deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;
