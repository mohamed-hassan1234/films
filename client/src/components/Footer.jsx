const links = ["FAQ", "Help Center", "Account", "Terms", "Privacy", "Contact"];

const Footer = () => (
  <footer className="border-t border-white/10 bg-black px-4 py-10 text-sm text-zinc-400 md:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {links.map((link) => <a key={link} href="#" className="underline-offset-2 hover:underline">{link}</a>)}
      </div>
      <select className="mt-8 rounded border border-white/20 bg-black px-4 py-2">
        <option>English</option>
        <option>Somali</option>
        <option>Swahili</option>
      </select>
      <p className="mt-6">StreamWave</p>
    </div>
  </footer>
);

export default Footer;
