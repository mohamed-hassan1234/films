import { Film } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "user@streamwave.test");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/browse");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in");
    }
  };

  return (
    <div className="poster-collage flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-black/80 p-8 shadow-glow">
        <Link to="/" className="mb-8 flex items-center gap-2 text-2xl font-black text-wave-red"><Film fill="currentColor" /> StreamWave</Link>
        <h1 className="text-3xl font-bold">Sign In</h1>
        {error && <p className="mt-4 rounded bg-red-950 p-3 text-sm text-red-100">{error}</p>}
        {message && <p className="mt-4 rounded bg-emerald-950 p-3 text-sm text-emerald-100">{message}</p>}
        <input className="field mt-6" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <input className="field mt-4" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
        <button disabled={loading} className="btn-primary mt-6 w-full">Sign In</button>
        <p className="mt-5 text-zinc-400">New to StreamWave? <Link className="text-white hover:underline" to="/register">Create an account</Link></p>
        <p className="mt-3 text-xs text-zinc-500">Admin demo: admin@streamwave.test / password123</p>
      </form>
    </div>
  );
};

export default Login;
