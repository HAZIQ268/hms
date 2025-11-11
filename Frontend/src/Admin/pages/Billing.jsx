import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [guests, setGuests] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    bill_id: "",
    booking_id: "",
    guest_id: "",
    room_charges: 0,
    service_type: "",
    service_charges: 0,
    payment_status: "Pending",
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch data when component loads
  useEffect(() => {
    fetchBills();
    fetchGuests();
    fetchServices();
  }, []);

  async function fetchBills() {
    try {
      const res = await api.get("/bills");
      setBills(res.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  }

  async function fetchGuests() {
    try {
      const res = await api.get("/bills/guests");
      setGuests(res.data);
    } catch (err) {
      console.error("Error fetching guests:", err);
    }
  }

  async function fetchServices() {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  }

  // ✅ Auto-generate Bill ID
  function generateBillId() {
    return "BILL-" + Date.now().toString().slice(-6);
  }

  // ✅ Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "service_type") {
      const selected = services.find((s) => s._id === value);
      setForm((prev) => ({
        ...prev,
        service_type: selected ? selected.service_name : "",
        service_charges: selected ? selected.price : 0,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name.includes("charges") ? parseFloat(value) || 0 : value,
      }));
    }
  }

  // ✅ Auto-calculate total
  const total = (form.room_charges || 0) + (form.service_charges || 0);

  // ✅ Create or Update Bill
  async function createOrUpdateBill(e) {
    e.preventDefault();
    const payload = {
      ...form,
      total,
      bill_id: form.bill_id || generateBillId(),
    };

    try {
      if (editingId) {
        await api.put(`/bills/${editingId}`, payload);
        alert("✅ Bill updated successfully!");
      } else {
        await api.post("/bills", payload);
        alert("✅ Bill created successfully!");
      }
      resetForm();
      fetchBills();
    } catch (err) {
      console.error("Error saving bill:", err);
      alert("❌ Error saving bill.");
    }
  }

  // ✅ Reset Form
  function resetForm() {
    setForm({
      bill_id: "",
      booking_id: "",
      guest_id: "",
      room_charges: 0,
      service_type: "",
      service_charges: 0,
      payment_status: "Pending",
    });
    setEditingId(null);
  }

  // ✅ Edit Bill
  function handleEdit(bill) {
    setForm({
      bill_id: bill.bill_id,
      booking_id: bill.booking_id,
      guest_id: bill.guest_id?._id || "",
      service_type: bill.service_type || "",
      room_charges: bill.room_charges,
      service_charges: bill.service_charges,
      payment_status: bill.payment_status,
    });
    setEditingId(bill._id);
  }

  // ✅ Delete Bill
  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await api.delete(`/bills/${id}`);
        alert("🗑️ Bill deleted successfully!");
        fetchBills();
      } catch (err) {
        console.error("Error deleting bill:", err);
        alert("Error deleting bill.");
      }
    }
  }

  // ✅ Download Invoice
  async function downloadInvoice(id) {
    const res = await api.post(
      `/bills/${id}/generate-invoice`,
      { emailInvoice: false },
      { responseType: "blob" }
    );
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ✅ Email Invoice
  async function emailInvoice(id) {
    await api.post(`/bills/${id}/generate-invoice`, { emailInvoice: true });
    alert("📧 Invoice sent to guest email!");
  }

  // ✅ UI
  return (
    <div className="container mt-4">
      <h3>Billing Management</h3>

      {/* ------------------ FORM ------------------ */}
      <div className="card p-4 mb-4 shadow-sm">
        <form className="row g-3" onSubmit={createOrUpdateBill}>
          {/* Booking ID */}
          <div className="col-md-4">
            <label className="form-label">Booking ID</label>
            <input
              className="form-control"
              name="booking_id"
              value={form.booking_id}
              onChange={handleChange}
              required
            />
          </div>

          {/* Guest Dropdown */}
          <div className="col-md-4">
            <label className="form-label">Guest</label>
            <select
              className="form-select"
              name="guest_id"
              value={form.guest_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Guest</option>
              {guests.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.email})
                </option>
              ))}
            </select>
          </div>

          {/* Room Charges */}
          <div className="col-md-4">
            <label className="form-label">Room Charges</label>
            <input
              type="number"
              className="form-control"
              name="room_charges"
              value={form.room_charges}
              onChange={handleChange}
            />
          </div>

          {/* Service Dropdown */}
          <div className="col-md-4">
            <label className="form-label">Service</label>
            <select
              className="form-select"
              name="service_type"
              value={
                services.find((s) => s.service_name === form.service_type)?._id ||
                ""
              }
              onChange={handleChange}
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.service_name} — Rs.{s.price}
                </option>
              ))}
            </select>
          </div>

          {/* Service Charges */}
          <div className="col-md-4">
            <label className="form-label">Service Charges</label>
            <input
              type="number"
              className="form-control"
              name="service_charges"
              value={form.service_charges}
              readOnly
            />
          </div>

          {/* Total */}
          <div className="col-md-4">
            <label className="form-label">Total</label>
            <input className="form-control" value={total} disabled />
          </div>

          {/* Payment Status */}
          <div className="col-md-4">
            <label className="form-label">Payment Status</label>
            <select
              className="form-select"
              name="payment_status"
              value={form.payment_status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="col-12">
            <button className="btn btn-primary me-2">
              {editingId ? "Update Bill" : "Create Bill"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ------------------ TABLE ------------------ */}
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Bill ID</th>
            <th>Booking</th>
            <th>Guest</th>
            <th>Room</th>
            <th>Service</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b._id}>
              <td>{b.bill_id}</td>
              <td>{b.booking_id}</td>
              <td>{b.guest_id?.name}</td>
              <td>Rs. {b.room_charges}</td>
              <td>
                {b.service_type} (Rs. {b.service_charges})
              </td>
              <td>Rs. {b.total}</td>
              <td>{b.payment_status}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEdit(b)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger me-2"
                  onClick={() => handleDelete(b._id)}
                >
                  Delete
                </button>
                <button
                  className="btn btn-sm btn-success me-2"
                  onClick={() => downloadInvoice(b._id)}
                >
                  PDF
                </button>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => emailInvoice(b._id)}
                >
                  Email
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import api from "../../services/api";

// export default function Billing() {
//   const [bills, setBills] = useState([]);
//   const [guests, setGuests] = useState([]);
//   const [form, setForm] = useState({
//     bill_id: "",
//     booking_id: "",
//     guest_id: "",
//     room_charges: 0,
//     service_type: "",
//     service_charges: 0,
//     payment_status: "Pending",
//   });
//   const [editingId, setEditingId] = useState(null);

//   const serviceOptions = [
//     { type: "room_service", label: "Room Service - Rs.1000", amount: 1000 },
//     { type: "laundry", label: "Laundry - Rs.500", amount: 500 },
//     { type: "spa", label: "Spa - Rs.2500", amount: 2500 },
//     { type: "cleaning", label: "Cleaning - Rs.700", amount: 700 },
//   ];

//   // ✅ Fetch bills and guests
//   useEffect(() => {
//     fetchBills();
//     fetchGuests();
//   }, []);

//   async function fetchBills() {
//     try {
//       const res = await api.get("/bills");
//       setBills(res.data);
//     } catch (err) {
//       console.error("Error fetching bills:", err);
//     }
//   }

//   async function fetchGuests() {
//     try {
//       const res = await api.get("/bills/guests");
//       setGuests(res.data);
//     } catch (err) {
//       console.error("Error fetching guests:", err);
//     }
//   }

//   // ✅ Handle change (inputs + dropdowns)
//   function handleChange(e) {
//     const { name, value } = e.target;
//     if (name === "service_type") {
//       const selected = serviceOptions.find((s) => s.type === value);
//       setForm((prev) => ({
//         ...prev,
//         service_type: value,
//         service_charges: selected ? selected.amount : 0,
//       }));
//     } else {
//       setForm((prev) => ({
//         ...prev,
//         [name]: name.includes("charges") ? parseFloat(value) || 0 : value,
//       }));
//     }
//   }

//   const total = (form.room_charges || 0) + (form.service_charges || 0);

//   // ✅ Create or Update Bill
//   async function createOrUpdateBill(e) {
//     e.preventDefault();
//     const payload = { ...form, total };
//     try {
//       if (editingId) {
//         await api.put(`/bills/${editingId}`, payload);
//         alert("✅ Bill updated successfully!");
//       } else {
//         await api.post("/bills", payload);
//         alert("✅ Bill created successfully!");
//       }
//       resetForm();
//       fetchBills();
//     } catch (err) {
//       console.error("Error saving bill:", err);
//       alert("❌ Error saving bill.");
//     }
//   }

//   // ✅ Reset form
//   function resetForm() {
//     setForm({
//       bill_id: "",
//       booking_id: "",
//       guest_id: "",
//       service_type: "",
//       room_charges: 0,
//       service_charges: 0,
//       payment_status: "Pending",
//     });
//     setEditingId(null);
//   }

//   // ✅ Edit bill
//   function handleEdit(bill) {
//     setForm({
//       bill_id: bill.bill_id,
//       booking_id: bill.booking_id,
//       guest_id: bill.guest_id?._id || "",
//       service_type: bill.service_type || "",
//       room_charges: bill.room_charges,
//       service_charges: bill.service_charges,
//       payment_status: bill.payment_status,
//     });
//     setEditingId(bill._id);
//   }

//   // ✅ Delete bill
//   async function handleDelete(id) {
//     if (window.confirm("Are you sure you want to delete this bill?")) {
//       try {
//         await api.delete(`/bills/${id}`);
//         alert("🗑️ Bill deleted successfully!");
//         fetchBills();
//       } catch (err) {
//         console.error("Error deleting bill:", err);
//         alert("Error deleting bill.");
//       }
//     }
//   }

//   // ✅ Download / Email Invoice
//   async function downloadInvoice(id) {
//     const res = await api.post(
//       `/bills/${id}/generate-invoice`,
//       { emailInvoice: false },
//       { responseType: "blob" }
//     );
//     const blob = new Blob([res.data], { type: "application/pdf" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `invoice_${id}.pdf`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   }

//   async function emailInvoice(id) {
//     await api.post(`/bills/${id}/generate-invoice`, { emailInvoice: true });
//     alert("📧 Invoice sent to guest email!");
//   }

//   // ✅ UI
//   return (
//     <div className="container mt-4">
//       <h3>Billing Management</h3>

//       {/* ------------------ FORM ------------------ */}
//       <div className="card p-4 mb-4 shadow-sm">
//         <form className="row g-3" onSubmit={createOrUpdateBill}>
//           {/* Bill ID */}
//           <div className="col-md-4">
//             <label className="form-label">Bill ID</label>
//             <input
//               className="form-control"
//               value={form.bill_id}
//               disabled
//               placeholder="Auto-generated"
//             />
//           </div>

//           {/* Booking ID */}
//           <div className="col-md-4">
//             <label className="form-label">Booking ID</label>
//             <input
//               className="form-control"
//               name="booking_id"
//               value={form.booking_id}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Guest Dropdown */}
//           <div className="col-md-4">
//             <label className="form-label">Guest</label>
//             <select
//               className="form-select"
//               name="guest_id"
//               value={form.guest_id}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Guest</option>
//               {guests.map((g) => (
//                 <option key={g._id} value={g._id}>
//                   {g.name} ({g.email})
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Room Charges */}
//           <div className="col-md-4">
//             <label className="form-label">Room Charges</label>
//             <input
//               type="number"
//               className="form-control"
//               name="room_charges"
//               value={form.room_charges}
//               onChange={handleChange}
//             />
//           </div>

//           {/* Service Dropdown */}
//           <div className="col-md-4">
//             <label className="form-label">Service Type</label>
//             <select
//               className="form-select"
//               name="service_type"
//               value={form.service_type}
//               onChange={handleChange}
//             >
//               <option value="">Select Service</option>
//               {serviceOptions.map((s) => (
//                 <option key={s.type} value={s.type}>
//                   {s.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Service Charges */}
//           <div className="col-md-4">
//             <label className="form-label">Service Charges</label>
//             <input
//               type="number"
//               className="form-control"
//               name="service_charges"
//               value={form.service_charges}
//               readOnly
//             />
//           </div>

//           {/* Total */}
//           <div className="col-md-4">
//             <label className="form-label">Total</label>
//             <input className="form-control" value={total} disabled />
//           </div>

//           {/* Payment Status */}
//           <div className="col-md-4">
//             <label className="form-label">Payment Status</label>
//             <select
//               className="form-select"
//               name="payment_status"
//               value={form.payment_status}
//               onChange={handleChange}
//             >
//               <option value="Pending">Pending</option>
//               <option value="Paid">Paid</option>
//             </select>
//           </div>

//           {/* Buttons */}
//           <div className="col-12">
//             <button className="btn btn-primary me-2">
//               {editingId ? "Update Bill" : "Create Bill"}
//             </button>
//             {editingId && (
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={resetForm}
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* ------------------ TABLE ------------------ */}
//       <table className="table table-striped table-bordered">
//         <thead>
//           <tr>
//             <th>Bill ID</th>
//             <th>Booking</th>
//             <th>Guest</th>
//             <th>Room</th>
//             <th>Service</th>
//             <th>Total</th>
//             <th>Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {bills.map((b) => (
//             <tr key={b._id}>
//               <td>{b.bill_id}</td>
//               <td>{b.booking_id}</td>
//               <td>{b.guest_id?.name}</td>
//               <td>Rs. {b.room_charges}</td>
//               <td>
//                 {b.service_type?.replace("_", " ")} (Rs. {b.service_charges})
//               </td>
//               <td>Rs. {b.total}</td>
//               <td>{b.payment_status}</td>
//               <td>
//                 <button
//                   className="btn btn-sm btn-warning me-2"
//                   onClick={() => handleEdit(b)}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   className="btn btn-sm btn-outline-primary me-2"
//                   onClick={() => downloadInvoice(b.bill_id)}
//                 >
//                   Download
//                 </button>
//                 <button
//                   className="btn btn-sm btn-outline-success me-2"
//                   onClick={() => emailInvoice(b.bill_id)}
//                 >
//                   Email
//                 </button>
//                 <button
//                   className="btn btn-sm btn-danger"
//                   onClick={() => handleDelete(b._id)}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }



// // import React, { useEffect, useState } from "react";
// // import api from "../../services/api";

// // export default function Billing() {
// //   const [bills, setBills] = useState([]);
// //   const [guests, setGuests] = useState([]);
// //   const [form, setForm] = useState({
// //     bill_id: "",
// //     booking_id: "",
// //     guest_id: "",
// //     room_charges: 0,
// //     service_charges: 0,
// //     payment_status: "Pending",
// //   });
// //   const [editingId, setEditingId] = useState(null);

// //   // Fetch Bills & Guests
// //   useEffect(() => {
// //     fetchBills();
// //     fetchGuests();
// //   }, []);

// //   async function fetchBills() {
// //     try {
// //       const res = await api.get("/bills");
// //       setBills(res.data);
// //     } catch (err) {
// //       console.error("Error fetching bills:", err);
// //     }
// //   }

// //   async function fetchGuests() {
// //     try {
// //       const res = await api.get("/bills/guests");
// //       setGuests(res.data);
// //     } catch (err) {
// //       console.error("Error fetching guests:", err);
// //     }
// //   }

// //   // Create or Update Bill
// //   async function createOrUpdateBill(e) {
// //     e.preventDefault();
// //     const payload = { ...form };
// //     try {
// //       if (editingId) {
// //         await api.put(`/bills/${editingId}`, payload);
// //         alert("Bill updated successfully!");
// //       } else {
// //         const res = await api.post("/bills", payload);
// //         setForm({ ...form, bill_id: res.data.bill_id });
// //         alert("Bill created successfully!");
// //       }
// //       setEditingId(null);
// //       resetForm();
// //       fetchBills();
// //     } catch (err) {
// //       console.error("Error saving bill:", err);
// //       alert("❌ Error saving bill.");
// //     }
// //   }

// //   // Reset form
// //   function resetForm() {
// //     setForm({
// //       bill_id: "",
// //       booking_id: "",
// //       guest_id: "",
// //       room_charges: 0,
// //       service_charges: 0,
// //       payment_status: "Pending",
// //     });
// //     setEditingId(null);
// //   }

// //   // Edit existing bill
// //   function handleEdit(bill) {
// //     setForm({
// //       bill_id: bill.bill_id,
// //       booking_id: bill.booking_id,
// //       guest_id: bill.guest_id?._id || "",
// //       room_charges: bill.room_charges,
// //       service_charges: bill.service_charges,
// //       payment_status: bill.payment_status,
// //     });
// //     setEditingId(bill._id);
// //   }

// //   // Handle input
// //   function handleChange(e) {
// //     const { name, value } = e.target;
// //     setForm((prev) => ({
// //       ...prev,
// //       [name]: name.includes("charges") ? parseFloat(value) || 0 : value,
// //     }));
// //   }

// //   // Delete bill
// //   async function handleDelete(id) {
// //     if (window.confirm("Are you sure you want to delete this bill?")) {
// //       try {
// //         await api.delete(`/bills/${id}`);
// //         alert(" Bill deleted successfully!");
// //         fetchBills();
// //       } catch (err) {
// //         console.error("Error deleting bill:", err);
// //         alert("Error deleting bill.");
// //       }
// //     }
// //   }

// //   // Download invoice
// //   async function downloadInvoice(id) {
// //     const res = await api.post(
// //       `/bills/${id}/generate-invoice`,
// //       { emailInvoice: false },
// //       { responseType: "blob" }
// //     );
// //     const blob = new Blob([res.data], { type: "application/pdf" });
// //     const url = window.URL.createObjectURL(blob);
// //     const a = document.createElement("a");
// //     a.href = url;
// //     a.download = `invoice_${id}.pdf`;
// //     a.click();
// //     window.URL.revokeObjectURL(url);
// //   }

// //   // Email invoice
// //   async function emailInvoice(id) {
// //     await api.post(`/bills/${id}/generate-invoice`, { emailInvoice: true });
// //     alert(" Invoice sent to guest email!");
// //   }

// //   const total = (form.room_charges || 0) + (form.service_charges || 0);

// //   return (
// //     <div className="container mt-4">
// //       <h3> Billing</h3>

// //       {/* ----------------- FORM ----------------- */}
// //       <div className="card p-4 mb-4 shadow-sm">
// //         <form className="row g-3" onSubmit={createOrUpdateBill}>
// //           {/* Bill ID */}
// //           <div className="col-md-4">
// //             <label className="form-label">Bill ID</label>
// //             <input
// //               className="form-control"
// //               value={form.bill_id}
// //               disabled
// //               placeholder="Auto-generated"
// //             />
// //           </div>

// //           {/* Booking ID */}
// //           <div className="col-md-4">
// //             <label className="form-label">Booking ID</label>
// //             <input
// //               className="form-control"
// //               name="booking_id"
// //               value={form.booking_id}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>

// //           {/* Guest Dropdown */}
// //           <div className="col-md-4">
// //             <label className="form-label">Guest</label>
// //             <select
// //               className="form-select"
// //               name="guest_id"
// //               value={form.guest_id}
// //               onChange={handleChange}
// //               required
// //             >
// //               <option value="">Select Guest</option>
// //               {guests.map((g) => (
// //                 <option key={g._id} value={g._id}>
// //                   {g.name} ({g.email})
// //                 </option>
// //               ))}
// //             </select>
// //           </div>

// //           {/* Room Charges */}
// //           <div className="col-md-4">
// //             <label className="form-label">Room Charges</label>
// //             <input
// //               type="number"
// //               className="form-control"
// //               name="room_charges"
// //               value={form.room_charges}
// //               onChange={handleChange}
// //             />
// //           </div>

// //           {/* Service Charges */}
// //           <div className="col-md-4">
// //             <label className="form-label">Service Charges</label>
// //             <input
// //               type="number"
// //               className="form-control"
// //               name="service_charges"
// //               value={form.service_charges}
// //               onChange={handleChange}
// //             />
// //           </div>

// //           {/* Total */}
// //           <div className="col-md-4">
// //             <label className="form-label">Total</label>
// //             <input className="form-control" value={total} disabled />
// //           </div>

// //           {/* Payment Status */}
// //           <div className="col-md-4">
// //             <label className="form-label">Payment Status</label>
// //             <select
// //               className="form-select"
// //               name="payment_status"
// //               value={form.payment_status}
// //               onChange={handleChange}
// //             >
// //               <option value="Pending">Pending</option>
// //               <option value="Paid">Paid</option>
// //             </select>
// //           </div>

// //           {/* Buttons */}
// //           <div className="col-12">
// //             <button className="btn btn-primary me-2">
// //               {editingId ? "Update Bill" : "Create Bill"}
// //             </button>
// //             {editingId && (
// //               <button
// //                 type="button"
// //                 className="btn btn-secondary"
// //                 onClick={resetForm}
// //               >
// //                 Cancel
// //               </button>
// //             )}
// //           </div>
// //         </form>
// //       </div>

// //       {/* ----------------- TABLE ----------------- */}
// //       <table className="table table-striped table-bordered">
// //         <thead>
// //           <tr>
// //             <th>Bill ID</th>
// //             <th>Booking</th>
// //             <th>Guest</th>
// //             <th>Total</th>
// //             <th>Status</th>
// //             <th>Actions</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {bills.map((b) => (
// //             <tr key={b._id}>
// //               <td>{b.bill_id}</td>
// //               <td>{b.booking_id}</td>
// //               <td>{b.guest_id?.name}</td>
// //               <td>{b.total}</td>
// //               <td>{b.payment_status}</td>
// //               <td>
// //                 <button
// //                   className="btn btn-sm btn-warning me-2"
// //                   onClick={() => handleEdit(b)}
// //                 >
// //                    Edit
// //                 </button>
// //                 <button
// //                   className="btn btn-sm btn-outline-primary me-2"
// //                   onClick={() => downloadInvoice(b.bill_id)}
// //                 >
// //                  Download
// //                 </button>
// //                 <button
// //                   className="btn btn-sm btn-outline-success me-2"
// //                   onClick={() => emailInvoice(b.bill_id)}
// //                 >
// //                  Email
// //                 </button>
// //                 <button
// //                   className="btn btn-sm btn-danger"
// //                   onClick={() => handleDelete(b._id)}
// //                 >
// //                    Delete
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // }
