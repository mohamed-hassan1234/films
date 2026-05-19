import { Construction, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPlaceholder = ({ title = "Admin Tool", description = "This section is ready for the next workflow." }) => (
  <div className="rounded-lg border border-white/10 bg-wave-panel p-8">
    <Construction className="text-wave-red" size={36} />
    <h2 className="mt-4 text-3xl font-black">{title}</h2>
    <p className="mt-2 max-w-2xl text-zinc-400">{description}</p>
    <Link to="/admin/movies/new" className="btn-primary mt-6">
      <UploadCloud size={18} />
      Upload Movie
    </Link>
  </div>
);

export default AdminPlaceholder;
