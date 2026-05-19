const AdminForm = ({ children, onSubmit, title }) => (
  <form onSubmit={onSubmit} className="admin-card grid gap-4">
    {title && <h2 className="text-xl font-bold">{title}</h2>}
    {children}
  </form>
);

export default AdminForm;
