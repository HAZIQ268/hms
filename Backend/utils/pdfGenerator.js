const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateInvoice(bill, guest, cb) {
  try {
    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const filename = `invoice_${bill.bill_id}.pdf`;
    const filePath = path.join(tmpDir, filename);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // 🌟 HEADER
    doc
      .fontSize(24)
      .fillColor("#2C3E50")
      .text("LuxuryStay Hospitality", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(14)
      .fillColor("#7F8C8D")
      .text("Luxury, Comfort, and Care — Always.", { align: "center" })
      .moveDown(1.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#BDC3C7")
      .stroke()
      .moveDown(1);

    // 🧾 INVOICE DETAILS
    doc
      .fontSize(18)
      .fillColor("#34495E")
      .text("Invoice", { align: "left" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Invoice ID: ${bill.bill_id}`)
      .text(`Booking ID: ${bill.booking_id}`)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .moveDown(1);

    // 👤 GUEST DETAILS
    doc
      .fontSize(14)
      .fillColor("#34495E")
      .text("Guest Information", { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Name: ${guest?.name || "N/A"}`)
      .text(`Email: ${guest?.email || "N/A"}`)
      .text(`Contact: ${guest?.contact || "N/A"}`)
      .moveDown(1.5);

    // 💰 CHARGES TABLE
    doc
      .fontSize(14)
      .fillColor("#34495E")
      .text("Billing Summary", { underline: true })
      .moveDown(0.5);

    const startX = 60;
    const tableWidth = 480;
    const rowHeight = 25;
    let y = doc.y;

    // Table Header
    doc
      .rect(startX, y, tableWidth, rowHeight)
      .fill("#2C3E50")
      .fillColor("white")
      .fontSize(12)
      .text("Description", startX + 10, y + 7)
      .text("Amount (PKR)", startX + 350, y + 7);

    y += rowHeight;

    // Table Rows
    const rows = [
      { desc: "Room Charges", amt: bill.room_charges },
      { desc: "Service Charges", amt: bill.services?.length ? bill.services.reduce((a, s) => a + (s.amount || 0), 0) : 0 },
    ];

    rows.forEach((r, i) => {
      doc
        .rect(startX, y, tableWidth, rowHeight)
        .fill(i % 2 === 0 ? "#ECF0F1" : "#FFFFFF")
        .fillColor("black")
        .text(r.desc, startX + 10, y + 7)
        .text(r.amt.toFixed(2), startX + 400, y + 7, { align: "right" });
      y += rowHeight;
    });

    // Total Row
    doc
      .rect(startX, y, tableWidth, rowHeight)
      .fill("#27AE60")
      .fillColor("white")
      .fontSize(12)
      .text("Total", startX + 10, y + 7)
      .text(bill.total.toFixed(2), startX + 400, y + 7, { align: "right" });
    y += rowHeight + 20;

    // ✅ PAYMENT STATUS
    doc
      .fontSize(12)
      .fillColor("#2C3E50")
      .text(`Payment Status: ${bill.payment_status}`, startX, y)
      .moveDown(1.5);

    // ❤️ FOOTER
    doc
      .fontSize(10)
      .fillColor("#7F8C8D")
      .text("Thank you for staying at LuxuryStay Hospitality.", { align: "center" })
      .text("For any inquiries, contact: luxurystayhospitality@gmail.com", { align: "center" })
      .text("Phone: +92-300-1234567", { align: "center" });

    doc.end();

    stream.on("finish", () => cb(null, filePath, filename));
    stream.on("error", (err) => cb(err));
  } catch (err) {
    cb(err);
  }
}

module.exports = { generateInvoice };
