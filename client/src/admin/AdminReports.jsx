import { useEffect, useState } from "react";
import AdminTable from "../components/AdminTable";
import api from "../services/api";

const AdminReports = () => {
  const [reports, setReports] = useState({ watchHistory: [], newUsers: [], genreCounts: [] });
  useEffect(() => { api.get("/admin/reports").then(({ data }) => setReports(data)); }, []);
  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-black">Reports</h1>
      <section>
        <h2 className="mb-3 text-xl font-bold">New Users</h2>
        <AdminTable columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }]} rows={reports.newUsers || []} />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">Watch History</h2>
        <AdminTable
          columns={[
            { key: "user", label: "User", render: (row) => row.user?.email || "Unknown" },
            { key: "content", label: "Content", render: (row) => row.content?.title || "Deleted content" },
            { key: "progress", label: "Progress", render: (row) => `${Math.round(row.progress || 0)}s` },
            { key: "lastWatchedAt", label: "Last watched", render: (row) => new Date(row.lastWatchedAt).toLocaleString() }
          ]}
          rows={reports.watchHistory || []}
        />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">Content Count by Genre</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {(reports.genreCounts || []).map((row) => <div key={row._id} className="admin-card"><div className="text-sm text-zinc-400">Genre</div><div className="truncate">{row.name}</div><div className="mt-3 text-3xl font-black">{row.count}</div></div>)}
        </div>
      </section>
    </div>
  );
};

export default AdminReports;
