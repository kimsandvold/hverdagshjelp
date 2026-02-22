import Button from '../ui/Button';

export default function AdminTable({ columns = [], data = [], actions = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        {/* Header */}
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {col.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Handlinger
              </th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id ?? rowIdx}
              className="border-b border-gray-100 even:bg-gray-50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="whitespace-nowrap px-5 py-3 text-gray-700"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="whitespace-nowrap px-5 py-3">
                  <div className="flex items-center gap-2">
                    {actions.map((action, actionIdx) => {
                      const label = typeof action.label === 'function' ? action.label(row) : action.label;
                      return (
                        <Button
                          key={actionIdx}
                          variant={action.variant ?? 'secondary'}
                          size="sm"
                          onClick={() => action.onClick(row)}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                className="px-5 py-8 text-center text-gray-400"
              >
                Ingen data \u00e5 vise
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
