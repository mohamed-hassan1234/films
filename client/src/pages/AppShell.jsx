import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const AppShell = () => (
  <div className="min-h-screen bg-wave-deep">
    <Navbar />
    <Outlet />
  </div>
);

export default AppShell;
