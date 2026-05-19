const EmptyState = ({ message = "Nothing to show yet." }) => (
  <div className="rounded-lg border border-dashed border-white/15 bg-white/[.03] p-8 text-center text-zinc-400">{message}</div>
);

export default EmptyState;
