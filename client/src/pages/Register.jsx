import { Film } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: location.state?.email || "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await register(form);
      setMessage(response.message || "Registration submitted. Wait for admin approval before signing in.");
      setTimeout(() => navigate("/login", { state: { message: response.message, email: form.email } }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register");
    }
  };

  return (
    <div className="poster-collage flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-black/80 p-8 shadow-glow">
        <Link to="/" className="mb-8 flex items-center gap-2 text-2xl font-black text-wave-red"><Film fill="currentColor" /> StreamWave</Link>
        <h1 className="text-3xl font-bold">Create your account</h1>
        {error && <p className="mt-4 rounded bg-red-950 p-3 text-sm text-red-100">{error}</p>}
        {message && <p className="mt-4 rounded bg-emerald-950 p-3 text-sm text-emerald-100">{message}</p>}
        <input className="field mt-6" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" />
        <input className="field mt-4" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" />
        <input className="field mt-4" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" />
        <button disabled={loading} className="btn-primary mt-6 w-full">Request Access</button>
        <p className="mt-5 text-zinc-400">Already have an account? <Link className="text-white hover:underline" to="/login">Sign in</Link></p>
      </form>
    </div>
  );
};

export default Register;
