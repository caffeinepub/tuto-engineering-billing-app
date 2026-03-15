import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Wrench } from "lucide-react";
import type { FabricationRow } from "../lib/pdfGenerator";
import {
  calcFabricationAmount,
  calcFabricationTotal,
  formatCurrency,
} from "../lib/pdfGenerator";

interface FabricationCostTableProps {
  rows: FabricationRow[];
  onChange: (rows: FabricationRow[]) => void;
}

function createEmptyRow(): FabricationRow {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 0,
    ratePerUnit: 0,
  };
}

export default function FabricationCostTable({
  rows,
  onChange,
}: FabricationCostTableProps) {
  const total = calcFabricationTotal(rows);

  const updateRow = (
    id: string,
    field: keyof FabricationRow,
    value: string | number,
  ) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addRow = () => onChange([...rows, createEmptyRow()]);

  const removeLastRow = () => {
    if (rows.length > 0) onChange(rows.slice(0, -1));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-heading flex items-center gap-2 text-primary">
            <Wrench className="w-4 h-4" />
            Fabrication Costs
          </CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={removeLastRow}
              disabled={rows.length === 0}
              className="h-7 text-xs px-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Remove Last
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={addRow}
              className="h-7 text-xs px-2"
            >
              <PlusCircle className="w-3 h-3 mr-1" />
              Add Row
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="table-header-bg">
                <th className="px-2 py-2 text-center font-semibold w-10">#</th>
                <th className="px-2 py-2 text-left font-semibold">
                  Description
                </th>
                <th className="px-2 py-2 text-center font-semibold w-16">
                  Qty
                </th>
                <th className="px-2 py-2 text-right font-semibold w-28">
                  Rate / Unit
                </th>
                <th className="px-2 py-2 text-right font-semibold w-24">
                  Amount
                </th>
                <th className="px-2 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground text-xs"
                  >
                    No items added. Click "Add Row" to start.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={i % 2 === 0 ? "bg-card" : "table-row-alt"}
                  >
                    <td className="px-2 py-1 text-center text-muted-foreground font-medium">
                      {i + 1}
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        value={row.description}
                        onChange={(e) =>
                          updateRow(row.id, "description", e.target.value)
                        }
                        placeholder="Fabrication work description"
                        className="h-7 text-xs border-0 bg-transparent focus:bg-background focus:border focus:border-input px-1"
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="number"
                        min="0"
                        value={row.quantity || ""}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "quantity",
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                        className="h-7 text-xs text-center border-0 bg-transparent focus:bg-background focus:border focus:border-input px-1"
                      />
                    </td>
                    <td className="px-1 py-1">
                      <Input
                        type="number"
                        min="0"
                        value={row.ratePerUnit || ""}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "ratePerUnit",
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0.00"
                        className="h-7 text-xs text-right border-0 bg-transparent focus:bg-background focus:border focus:border-input px-1"
                      />
                    </td>
                    <td className="px-2 py-1 text-right font-semibold text-primary">
                      {formatCurrency(calcFabricationAmount(row))}
                    </td>
                    <td className="px-1 py-1">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-3">
          {rows.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground text-xs">
              No items added. Click "Add Row" to start.
            </p>
          ) : (
            rows.map((row, i) => (
              <div
                key={row.id}
                className="border border-border rounded-md p-3 bg-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Item #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  value={row.description}
                  onChange={(e) =>
                    updateRow(row.id, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="h-8 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor={`fab-qty-${row.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Qty
                    </label>
                    <Input
                      id={`fab-qty-${row.id}`}
                      type="number"
                      min="0"
                      value={row.quantity || ""}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "quantity",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="h-8 text-sm mt-0.5"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`fab-rate-${row.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Rate / Unit (₹)
                    </label>
                    <Input
                      id={`fab-rate-${row.id}`}
                      type="number"
                      min="0"
                      value={row.ratePerUnit || ""}
                      onChange={(e) =>
                        updateRow(
                          row.id,
                          "ratePerUnit",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0.00"
                      className="h-8 text-sm mt-0.5"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-accent rounded-md px-3 py-1 text-sm font-semibold text-primary">
                    {formatCurrency(calcFabricationAmount(row))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="mt-3 flex justify-end">
          <div className="bg-accent rounded-md px-4 py-2 flex items-center gap-3">
            <span className="text-xs font-semibold text-accent-foreground">
              Total Fabrication Cost:
            </span>
            <span className="text-sm font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
