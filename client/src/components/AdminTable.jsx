const AdminTable = ({ columns, rows, renderActions }) => (
  <div className="overflow-x-auto rounded-lg border border-white/10">
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="bg-white/5 text-zinc-300">
        <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-semibold">{column.label}</th>)}{renderActions && <th className="px-4 py-3">Actions</th>}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row._id} className="border-t border-white/10">
            {columns.map((column) => <td key={column.key} className="px-4 py-3">{column.render ? column.render(row) : row[column.key]}</td>)}
            {renderActions && <td className="px-4 py-3">{renderActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminTable;
