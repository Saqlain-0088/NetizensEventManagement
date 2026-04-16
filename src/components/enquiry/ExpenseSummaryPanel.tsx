import { useMemo } from "react";
import { AlertTriangle, TrendingUp, IndianRupee, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExpenseSummaryPanelProps {
  pax: number;
  ratePerPerson: number;
  taxPercent: number;
  advanceAmount: number;
  extrasTotal?: number;
  manualExtraFoodAmount?: number;
  onManualExtraFoodChange?: (val: number) => void;
  manualExtraEquipmentAmount?: number;
  onManualExtraEquipmentChange?: (val: number) => void;
  additionalExpenses?: number;
  onAdditionalExpensesChange?: (val: number) => void;
  onTaxPercentChange?: (val: number) => void;
  onAdvanceAmountChange?: (val: number) => void;
}

const ExpenseSummaryPanel = ({ 
  pax, 
  ratePerPerson, 
  taxPercent, 
  advanceAmount, 
  extrasTotal = 0,
  manualExtraFoodAmount = 0,
  onManualExtraFoodChange,
  manualExtraEquipmentAmount = 0,
  onManualExtraEquipmentChange,
  additionalExpenses = 0,
  onAdditionalExpensesChange,
  onTaxPercentChange,
  onAdvanceAmountChange
}: ExpenseSummaryPanelProps) => {
  const calc = useMemo(() => {
    const subtotal = pax * ratePerPerson;
    const additionalTotal = manualExtraFoodAmount + manualExtraEquipmentAmount + additionalExpenses;
    const allExtras = extrasTotal + additionalTotal;
    const taxAmount = (subtotal + allExtras) * (taxPercent / 100);
    const total = subtotal + allExtras + taxAmount;
    const balance = total - advanceAmount;
    return { subtotal, additionalTotal, allExtras, taxAmount, total, balance };
  }, [pax, ratePerPerson, taxPercent, advanceAmount, extrasTotal, manualExtraFoodAmount, manualExtraEquipmentAmount, additionalExpenses]);

  const anomalies: string[] = [];
  if (ratePerPerson > 0 && ratePerPerson < 200) anomalies.push("Rate per person seems unusually low");
  if (ratePerPerson > 5000) anomalies.push("Rate per person seems unusually high");
  if (pax > 0 && pax < 5) anomalies.push("Very small guest count");
  if (advanceAmount > calc.total && calc.total > 0) anomalies.push("Advance exceeds total amount");

  const avgRate = 800;

  if (!pax && !ratePerPerson) return null;

  return (
    <section className="rounded-2xl border border-primary/25 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
      
      {/* Left side: Advanced Manual Expense Input */}
      <div className="flex-1 p-5 bg-muted/10">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Additional Manual Expenses</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase text-left w-full block">Extra Food (₹)</Label>
            <Input 
              type="number"
              value={manualExtraFoodAmount || ""}
              onChange={(e) => onManualExtraFoodChange?.(Number(e.target.value))}
              placeholder="e.g. 5000"
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase text-left w-full block">Extra Equipment (₹)</Label>
            <Input 
              type="number"
              value={manualExtraEquipmentAmount || ""}
              onChange={(e) => onManualExtraEquipmentChange?.(Number(e.target.value))}
              placeholder="e.g. 2500"
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase text-left w-full block">Other Manual Expenses (₹)</Label>
            <Input 
              type="number"
              value={additionalExpenses || ""}
              onChange={(e) => onAdditionalExpensesChange?.(Number(e.target.value))}
              placeholder="e.g. 1000"
              className="bg-white"
            />
          <div className="space-y-1.5 pt-2 border-t border-border">
            <Label className="text-xs font-semibold text-muted-foreground uppercase text-left w-full block">Tax Percentage (%)</Label>
            <Input 
              type="number"
              value={taxPercent || ""}
              onChange={(e) => onTaxPercentChange?.(Number(e.target.value))}
              placeholder="e.g. 18"
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase text-left w-full block">Advance Amount Paid (₹)</Label>
            <Input 
              type="number"
              value={advanceAmount || ""}
              onChange={(e) => onAdvanceAmountChange?.(Number(e.target.value))}
              placeholder="e.g. 10000"
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Right side: Live Summary Values */}
      <div className="flex-[2_2_0%] flex flex-col">
          <div className="px-5 py-3.5 border-b border-primary/15 bg-primary/5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/15">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Live Expense Summary</h2>
            <span className="ml-auto text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-medium">Auto-calculated</span>
          </div>

          <div className="p-5 flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <SummaryItem label="Subtotal (Pax * Rate)" value={calc.subtotal} />
              {extrasTotal > 0 && <SummaryItem label="System Extras" value={extrasTotal} />}
              {calc.additionalTotal > 0 && <SummaryItem label="Manual Extras" value={calc.additionalTotal} />}
              <SummaryItem label={`Tax (${taxPercent}%)`} value={calc.taxAmount} />
              <SummaryItem label="Grand Total" value={calc.total} highlight />
              <SummaryItem label="Balance Due" value={calc.balance} highlight={calc.balance > 0} negative={calc.balance < 0} />
            </div>

            {anomalies.length > 0 && (
              <div className="space-y-2 mt-auto pt-4">
                {anomalies.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    {a}
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </section>
  );
};

const SummaryItem = ({
  label,
  value,
  highlight,
  negative,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
}) => (
  <div className={`rounded-xl p-3 border ${
    negative
      ? "bg-red-50 border-red-200"
      : highlight
      ? "bg-primary/8 border-primary/25"
      : "bg-muted/50 border-border"
  }`}>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-base font-bold ${
      negative ? "text-red-600" : highlight ? "text-primary" : "text-foreground"
    }`}>
      ₹{value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
    </p>
  </div>
);

export default ExpenseSummaryPanel;
