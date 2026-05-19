import { Plus } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProfileSelector = () => {
  const { profiles, activeProfile, switchProfile, setProfiles } = useAuth();
  const [name, setName] = useState("");

  const add = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    const { data } = await api.post("/profiles", { name });
    setProfiles([...profiles, data]);
    setName("");
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {profiles.map((profile) => (
        <button key={profile._id} onClick={() => switchProfile(profile)} className={`rounded-lg border p-5 text-left transition ${activeProfile?._id === profile._id ? "border-wave-red bg-red-950/30" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
          <img src={profile.avatar} alt={profile.name} className="h-20 w-20 rounded object-cover" />
          <div className="mt-4 text-lg font-semibold">{profile.name}</div>
          <div className="text-sm text-zinc-400">{profile.isKids ? "Kids profile" : "Adult profile"}</div>
        </button>
      ))}
      <form onSubmit={add} className="rounded-lg border border-dashed border-white/20 p-5">
        <Plus />
        <input value={name} onChange={(event) => setName(event.target.value)} className="field mt-4" placeholder="New profile name" />
        <button className="btn-primary mt-3 w-full">Create</button>
      </form>
    </div>
  );
};

export default ProfileSelector;
