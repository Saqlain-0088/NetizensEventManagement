import { ReactNode } from "react";
import { Pencil, Trash2, Star, ToggleLeft, ToggleRight } from "lucide-react";

interface Column<T> {
  label: string;
  render: (row: T) => ReactNode;
}

interface MasterTableProps<T extends { id: string; active: boolean; featured: boolean }> {
  rows: T[];
  columns: Column<T>[];
  onEdit: (row: T) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  emptyText?: string;
}

export function MasterTable<T extends { id: string; active: boolean; featured: boolean }>({
  rows,
  columns,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  emptyText = "No records found.",
}: MasterTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((c, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Featured</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.id} className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${ri % 2 === 0 ? "" : "bg-muted/10"}`}>
                {columns.map((c, ci) => (
                  <td key={ci} className="px-4 py-3 text-foreground">
                    {c.render(row)}
                  </td>
                ))}
                {/* Active toggle */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggleActive(row.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                      row.active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {row.active
                      ? <><ToggleRight className="h-3 w-3" /> Active</>
                      : <><ToggleLeft className="h-3 w-3" /> Inactive</>
                    }
                  </button>
                </td>
                {/* Featured toggle */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onToggleFeatured(row.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      row.featured
                        ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title={row.featured ? "Remove featured" : "Mark as featured"}
                  >
                    <Star className={`h-4 w-4 ${row.featured ? "fill-amber-400" : ""}`} />
                  </button>
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(row)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
