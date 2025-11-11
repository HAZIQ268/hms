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
// import api from "../../services/api"; //  Make sure api.js is set correctly

// export default function Settings() {
//   const [settings, setSettings] = useState({ tax_rate: 0.0, policies: "" });
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   //  Fetch settings
//   useEffect(() => {
//     async function fetchSettings() {
//       try {
//         const res = await api.get("/settings");
//         setSettings(res.data);
//       } catch (err) {
//         console.error("Error fetching settings:", err);
//         setMessage("Error loading settings");
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchSettings();
//   }, []);

//   //  Save settings
//   const save = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     try {
//       const res = await api.post("/settings", settings);
//       setMessage(" Settings saved successfully!");
//       setSettings(res.data.settings);
//     } catch (err) {
//       console.error(err);
//       setMessage("Error saving settings");
//     }
//   };


//   const resetDefaults = async () => {
//     if (!window.confirm("Are you sure you want to reset settings to default?"))
//       return;
//     try {
//       const res = await api.post("/settings/reset");
//       setSettings(res.data.settings);
//       setMessage(" Settings reset to default values!");
//     } catch (err) {
//       console.error("❌ Reset error:", err);
//       setMessage("Error resetting settings");
//     }
//   };

//   if (loading) return <div className="p-3">Loading settings...</div>;

//   return (
//     <div className="container mt-3">
//       <h3 className="mb-3">Settings</h3>

//       {message && <div className="alert alert-info">{message}</div>}

//       <form onSubmit={save}>
//         <div className="mb-3">
//           <label className="form-label">Tax Rate (%)</label>
//           <input
//             type="number"
//             className="form-control"
//             step="0.01"
//             value={settings.tax_rate}
//             onChange={(e) =>
//               setSettings({
//                 ...settings,
//                 tax_rate: parseFloat(e.target.value) || 0,
//               })
//             }
//           />
//         </div>

//         <div className="mb-3">
//           <label className="form-label">Policies</label>
//           <textarea
//             className="form-control"
//             rows="4"
//             value={settings.policies}
//             onChange={(e) =>
//               setSettings({ ...settings, policies: e.target.value })
//             }
//           ></textarea>
//         </div>

//         <button type="submit" className="btn btn-primary me-2">
//           Save
//         </button>
//         <button
//           type="button"
//           className="btn btn-warning"
//           onClick={resetDefaults}
//         >
//           Reset to Default
//         </button>
//       </form>
//     </div>
//   );
// }
