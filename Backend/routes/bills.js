const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const User = require("../models/User");
const { generateInvoice } = require("../utils/pdfGenerator");
const { sendInvoiceEmail } = require("../utils/emailService");

// ✅ Create Bill
router.post("/", async (req, res) => {
  try {
    const { booking_id, guest_id, room_charges, service_charges, payment_status } = req.body;
    const total = (room_charges || 0) + (service_charges || 0);

    const bill = new Bill({
      booking_id,
      guest_id,
      room_charges,
      service_charges,
      total,
      payment_status,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    console.error("Create Bill Error:", err);
    res.status(500).json({ message: "Error creating bill", error: err.message });
  }
});

// ✅ Get all Bills
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().populate("guest_id", "name email").sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update Bill
router.put("/:id", async (req, res) => {
  try {
    const { room_charges, service_charges } = req.body;
    const total = (room_charges || 0) + (service_charges || 0);

    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { ...req.body, total },
      { new: true }
    );

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete Bill
router.delete("/:id", async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Guest list for dropdown
router.get("/guests", async (req, res) => {
  try {
    const guests = await User.find({}, "_id name email");
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Generate + Email Invoice
router.post("/:bill_id/generate-invoice", async (req, res) => {
  try {
    const bill = await Bill.findOne({ bill_id: req.params.bill_id }).populate("guest_id");
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const guest = bill.guest_id;
    generateInvoice(bill, guest, async (err, filePath, filename) => {
      if (err) return res.status(500).json({ message: err.message });

      if (req.body.emailInvoice) {
        await sendInvoiceEmail(
          guest.email,
          `Invoice ${bill.bill_id}`,
          `Dear ${guest.name}, your invoice ${bill.bill_id} is attached.`,
          filePath,
          filename
        );
        return res.json({ message: "Invoice sent to guest email" });
      } else {
        res.download(filePath, filename, (err) => {
          if (err) console.error(err);
        });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
