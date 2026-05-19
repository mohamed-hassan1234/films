import ProfileSelector from "../components/ProfileSelector";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { logout } = useAuth();
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-12 pt-24 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black">Profiles</h1>
        <button onClick={logout} className="btn-muted">Sign out</button>
      </div>
      <ProfileSelector />
    </main>
  );
};

export default Profile;
