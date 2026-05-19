import { Plus, X } from "lucide-react";
import { useState } from "react";

const FAQAccordion = ({ items }) => {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.q} className="bg-zinc-900">
          <button onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between px-5 py-5 text-left text-lg md:text-2xl">
            {item.q}
            {open === index ? <X /> : <Plus />}
          </button>
          {open === index && <p className="border-t border-black px-5 py-5 text-zinc-200 md:text-lg">{item.a}</p>}
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
