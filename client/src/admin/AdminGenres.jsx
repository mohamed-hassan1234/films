import { useEffect, useState } from "react";
import AdminForm from "../components/AdminForm";
import AdminTable from "../components/AdminTable";
import api from "../services/api";

const AdminGenres = () => {
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/genres").then(({ data }) => setGenres(data));
  useEffect(() => { load(); }, []);
  const submit = async (event) => {
    event.preventDefault();
    if (editing) await api.put(`/genres/admin/${editing}`, form);
    else await api.post("/genres/admin", form);
    setForm({ name: "", description: "" });
    setEditing(null);
    load();
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <AdminForm title={editing ? "Edit Genre" : "Add Genre"} onSubmit={submit}>
        <input className="field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <textarea className="field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-primary">Save Genre</button>
      </AdminForm>
      <section>
        <h1 className="mb-4 text-3xl font-black">Genre Management</h1>
        <AdminTable columns={[{ key: "name", label: "Name" }, { key: "description", label: "Description" }]} rows={genres} renderActions={(genre) => <div className="flex gap-2"><button className="btn-muted py-2" onClick={() => { setEditing(genre._id); setForm(genre); }}>Edit</button><button className="rounded bg-red-900 px-3 py-2" onClick={() => api.delete(`/genres/admin/${genre._id}`).then(load)}>Delete</button></div>} />
      </section>
    </div>
  );
};

export default AdminGenres;
