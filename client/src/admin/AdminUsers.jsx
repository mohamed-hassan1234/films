import { useEffect, useState } from "react";
import AdminTable from "../components/AdminTable";
import api from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const load = () => api.get("/admin/users").then(({ data }) => setUsers(data));
  useEffect(() => { load(); }, []);
  const update = (user, patch) => api.put(`/admin/users/${user._id}`, patch).then(load);
  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">User Management</h1>
      <AdminTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "approvalStatus", label: "Approval", render: (user) => user.approvalStatus || "approved" },
          { key: "blocked", label: "Status", render: (user) => user.blocked ? "Blocked" : "Active" }
        ]}
        rows={users}
        renderActions={(user) => (
          <div className="flex flex-wrap gap-2">
            {(user.approvalStatus || "approved") !== "approved" && (
              <button className="btn-primary py-2" onClick={() => update(user, { approvalStatus: "approved" })}>Approve</button>
            )}
            {(user.approvalStatus || "approved") === "pending" && (
              <button className="btn-muted py-2" onClick={() => update(user, { approvalStatus: "rejected", blocked: true })}>Reject</button>
            )}
            <button className="btn-muted py-2" onClick={() => update(user, { role: user.role === "admin" ? "user" : "admin" })}>Toggle role</button>
            <button className="btn-muted py-2" onClick={() => update(user, { blocked: !user.blocked })}>{user.blocked ? "Unblock" : "Block"}</button>
            <button className="rounded bg-red-900 px-3 py-2" onClick={() => api.delete(`/admin/users/${user._id}`).then(load)}>Delete</button>
          </div>
        )}
      />
    </div>
  );
};

export default AdminUsers;
