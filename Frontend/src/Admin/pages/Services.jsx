import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function ServicesPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    service_name: "",
    details: "",
    price: "",
    status: "active",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await api.get("/services");
      setList(res.data);
    } catch {
      alert("Error fetching services");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (!form.service_name || !form.price) {
        alert("Please enter service name and price");
        return;
      }

      if (editId) {
        await api.put(`/services/${editId}`, form);
        setEditId(null);
      } else {
        await api.post("/services", form);
      }

      resetForm();
      fetchServices();
    } catch {
      alert("Error saving service");
    }
  }

  function resetForm() {
    setForm({ service_name: "", details: "", price: "", status: "active" });
  }

  function edit(service) {
    setForm({
      service_name: service.service_name,
      details: service.details,
      price: service.price,
      status: service.status,
    });
    setEditId(service._id);
  }

  async function remove(id) {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch {
      alert("Error deleting service");
    }
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Service Management</h3>

      <div className="card p-3 mb-3">
        <form className="row g-3" onSubmit={handleSubmit}>
          {/* SERVICE NAME */}
          <div className="col-md-3">
            <label className="form-label">Service Name</label>
            <input
              className="form-control"
              value={form.service_name}
              onChange={(e) => setForm({ ...form, service_name: e.target.value })}
              placeholder="e.g. Room Cleaning"
              required
            />
          </div>

          {/* PRICE */}
          <div className="col-md-3">
            <label className="form-label">Price (Rs)</label>
            <input
              type="number"
              className="form-control"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Enter price"
              required
            />
          </div>

          {/* STATUS */}
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* DETAILS */}
          <div className="col-md-3">
            <label className="form-label">Details</label>
            <input
              className="form-control"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Optional details"
            />
          </div>

          {/* BUTTONS */}
          <div className="col-12">
            <button className="btn btn-primary me-2">
              {editId ? "Update Service" : "Add Service"}
            </button>
            {editId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SERVICE LIST TABLE */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Service ID</th>
            <th>Name</th>
            <th>Price (Rs)</th>
            <th>Status</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s._id}>
              <td>{s.service_id}</td>
              <td>{s.service_name}</td>
              <td>{s.price}</td>
              <td>{s.status}</td>
              <td>{s.details}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => edit(s)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => remove(s._id)}
                >
                  Delete
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

// export default function ServicesPage() {
//   const [list, setList] = useState([]);
//   const [guests, setGuests] = useState([]);
//   const [form, setForm] = useState({
//     guest_id: "",
//     service_type: "room_service",
//     details: "",
//     status: "pending",
//   });
//   const [editId, setEditId] = useState(null);

//   useEffect(() => {
//     fetchServices();
//     fetchGuests();
//   }, []);

//   async function fetchServices() {
//     try {
//       const res = await api.get("/services");
//       setList(res.data);
//     } catch {
//       alert("Error fetching services");
//     }
//   }

//   async function fetchGuests() {
//     try {
//       const res = await api.get("/bills/guests"); // ✅ Correct route
//       setGuests(res.data);
//     } catch (err) {
//       console.error("Error fetching guests:", err);
//     }
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     try {
//       if (editId) {
//         await api.put(`/services/${editId}`, form);
//         setEditId(null);
//       } else {
//         await api.post("/services", form);
//       }
//       resetForm();
//       fetchServices();
//     } catch {
//       alert("Error saving service");
//     }
//   }

//   function resetForm() {
//     setForm({
//       guest_id: "",
//       service_type: "room_service",
//       details: "",
//       status: "pending",
//     });
//   }

//   function edit(service) {
//     setForm({
//       guest_id: service.guest_id,
//       service_type: service.service_type,
//       details: service.details,
//       status: service.status,
//     });
//     setEditId(service._id);
//   }

//   async function remove(id) {
//     if (!window.confirm("Are you sure?")) return;
//     try {
//       await api.delete(`/services/${id}`);
//       fetchServices();
//     } catch {
//       alert("Error deleting service");
//     }
//   }

//   return (
//     <div className="container mt-4">
//       <h3 className="mb-3">Service Management</h3>

//       <div className="card p-3 mb-3">
//         <form className="row g-3" onSubmit={handleSubmit}>
//           {/* GUEST DROPDOWN */}
//           <div className="col-md-3">
//             <label className="form-label">Guest</label>
//             <select
//               className="form-select"
//               value={form.guest_id}
//               onChange={(e) => setForm({ ...form, guest_id: e.target.value })}
//               required
//             >
//               <option value="">Select Guest</option>
//               {guests.length > 0 ? (
//                 guests.map((g) => (
//                   <option key={g._id} value={g._id}>
//                     {g.name} ({g.email})
//                   </option>
//                 ))
//               ) : (
//                 <option disabled>Loading...</option>
//               )}
//             </select>
//           </div>

//           {/* SERVICE TYPE */}
//           <div className="col-md-3">
//             <label className="form-label">Service Type</label>
//             <select
//               className="form-select"
//               value={form.service_type}
//               onChange={(e) => setForm({ ...form, service_type: e.target.value })}
//             >
//               <option value="room_service">Room Service - Rs.1000</option>
//               <option value="laundry">Laundry - Rs.500</option>
//               <option value="spa">Spa - Rs.2500</option>
//               <option value="cleaning">Cleaning - Rs.700</option>
//             </select>
//           </div>

//           {/* STATUS */}
//           <div className="col-md-3">
//             <label className="form-label">Status</label>
//             <select
//               className="form-select"
//               value={form.status}
//               onChange={(e) => setForm({ ...form, status: e.target.value })}
//             >
//               <option value="pending">Pending</option>
//               <option value="completed">Completed</option>
//             </select>
//           </div>

//           {/* DETAILS */}
//           <div className="col-md-3">
//             <label className="form-label">Details</label>
//             <input
//               className="form-control"
//               value={form.details}
//               onChange={(e) => setForm({ ...form, details: e.target.value })}
//               placeholder="Extra notes"
//             />
//           </div>

//           {/* BUTTONS */}
//           <div className="col-12">
//             <button className="btn btn-primary me-2">
//               {editId ? "Update Service" : "Add Service"}
//             </button>
//             {editId && (
//               <button type="button" className="btn btn-secondary" onClick={resetForm}>
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* SERVICE LIST */}
//       <table className="table table-striped">
//         <thead>
//           <tr>
//             <th>Service ID</th>
//             <th>Guest</th>
//             <th>Type</th>
//             <th>Price</th>
//             <th>Status</th>
//             <th>Details</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {list.map((s) => (
//             <tr key={s._id}>
//               <td>{s.service_id}</td>
//               <td>{guests.find((g) => g._id === s.guest_id)?.name || "Unknown"}</td>
//               <td>{s.service_type}</td>
//               <td>Rs. {s.price}</td>
//               <td>{s.status}</td>
//               <td>{s.details}</td>
//               <td>
//                 <button
//                   className="btn btn-sm btn-warning me-2"
//                   onClick={() => edit(s)}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   className="btn btn-sm btn-danger"
//                   onClick={() => remove(s._id)}
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
