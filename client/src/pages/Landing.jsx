import { Film } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import FAQAccordion from "../components/FAQAccordion";
import Footer from "../components/Footer";
import TrendingCard from "../components/TrendingCard";
import { contentImage } from "../utils/content";

const faqs = [
  { q: "What is StreamWave?", a: "StreamWave is a demo streaming platform for browsing, saving, and watching original or uploaded movie and series content." },
  { q: "How much does it cost?", a: "This local project includes a subscription-style signup flow for demonstration. Pricing can be connected to a payment provider later." },
  { q: "Where can I watch?", a: "Watch in any modern browser on desktop, tablet, or mobile." },
  { q: "How do I cancel?", a: "You can model cancellation in the account settings when adding billing integration." },
  { q: "What can I watch?", a: "Seeded demo titles are included, and admins can upload their own posters, banners, trailers, and videos." },
  { q: "Is it good for kids?", a: "Profiles can be marked as kids profiles and filtered to family-friendly genres." }
];

const Landing = () => {
  const [trending, setTrending] = useState([]);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const heroPosters = trending.length ? trending.slice(0, 14) : [];

  useEffect(() => {
    api.get("/movies?trending=true&limit=10").then(({ data }) => setTrending(data)).catch(() => setTrending([]));
  }, []);

  const start = (event) => {
    event.preventDefault();
    navigate("/register", { state: { email } });
  };

  return (
    <div className="bg-black text-white">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-wave-red">
            <Film size={32} fill="currentColor" /> StreamWave
          </Link>
          <div className="flex items-center gap-3">
            <select className="rounded border border-white/30 bg-black/60 px-3 py-2 text-sm">
              <option>English</option>
              <option>Somali</option>
              <option>Swahili</option>
            </select>
            <Link className="rounded bg-wave-red px-4 py-2 text-sm font-semibold hover:bg-red-700" to="/login">Sign In</Link>
          </div>
        </div>
      </header>

      <section className="poster-collage relative flex min-h-[86vh] items-center justify-center overflow-hidden px-4 pt-24 text-center">
        {heroPosters.length > 0 && (
          <div className="absolute inset-0 scale-110 opacity-45 blur-[1px]">
            <div className="-rotate-6 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-7">
              {[...heroPosters, ...heroPosters].map((item, index) => (
                <img
                  key={`${item._id}-${index}`}
                  src={contentImage(item)}
                  alt=""
                  className="aspect-[2/3] w-full rounded-md object-cover shadow-2xl"
                />
              ))}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/80" />
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl font-black leading-tight md:text-7xl">Unlimited movies, TV shows, and more</h1>
          <p className="mt-5 text-xl font-semibold md:text-2xl">Starts at USD 2.99. Cancel anytime.</p>
          <p className="mt-7 text-lg text-zinc-100 md:text-xl">Ready to watch? Enter your email to create or restart your membership.</p>
          <form onSubmit={start} className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="field flex-1" placeholder="Email address" />
            <button className="btn-primary min-h-14 text-lg md:text-2xl">Get Started</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <h2 className="mb-5 text-2xl font-bold">Trending Now</h2>
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-3">
          {trending.map((item, index) => <TrendingCard key={item._id} item={item} rank={index + 1} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h2 className="mb-5 text-2xl font-bold">More Reasons to Join</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {["Enjoy on your TV", "Download to watch offline", "Watch everywhere", "Create profiles for kids"].map((title) => (
            <div key={title} className="rounded-lg bg-gradient-to-br from-zinc-900 to-red-950/50 p-5">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-300">A polished local streaming experience with responsive screens and profile-aware browsing.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:px-8">
        <h2 className="mb-5 text-center text-3xl font-black">Frequently Asked Questions</h2>
        <FAQAccordion items={faqs} />
      </section>
      <Footer />
    </div>
  );
};

export default Landing;
