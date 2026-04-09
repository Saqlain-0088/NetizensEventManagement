import { useMemo } from "react";
import { AlertTriangle, TrendingUp, IndianRupee } from "lucide-react";

interface SummaryPanelProps {
  pax: number;
  ratePerPerson: number;
  taxPercent: number;
  advanceAmount: number;
}

const SummaryPanel = ({ pax, ratePerPerson, taxPercent, advanceAmount }: SummaryPanelProps) => {
  const calc = useMemo(() => {
    const subtotal = pax * ratePerPerson;
    const taxAmount = subtotal * (taxPercent / 100);
    const total = subtotal + taxAmount;
    const balance = total - advanceAmount;
    return { subtotal, taxAmount, total, balance };
  }, [pax, ratePerPerson, taxPercent, advanceAmount]);

  const anomalies: string[] = [];
  if (ratePerPerson > 0 && ratePerPerson < 200) anomalies.push("Rate per person seems unusually low");
  if (ratePerPerson > 5000) anomalies.push("Rate per person seems unusually high");
  if (pax > 0 && pax < 5) anomalies.push("Very small guest count");
  if (advanceAmount > calc.total && calc.total > 0) anomalies.push("Advance exceeds total amount");

  const avgRate = 800;

  if (!pax && !ratePerPerson) return null;

  return (
    <section className="rounded-2xl border border-primary/25 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-primary/15 bg-primary/5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/15">
          <IndianRupee className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Live Summary</h2>
        <span className="ml-auto text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-medium">Auto-calculated</span>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryItem label="Subtotal" value={calc.subtotal} />
          <SummaryItem label={`Tax (${taxPercent}%)`} value={calc.taxAmount} />
          <SummaryItem label="Grand Total" value={calc.total} highlight />
          <SummaryItem label="Balance Due" value={calc.balance} highlight={calc.balance > 0} negative={calc.balance < 0} />
        </div>

        {anomalies.length > 0 && (
          <div className="space-y-2">
            {anomalies.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                {a}
              </div>
            ))}
          </div>
        )}

        {ratePerPerson > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            Historical avg: ₹{avgRate}/person
            {Math.abs(ratePerPerson - avgRate) > 300 && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                ratePerPerson > avgRate
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {ratePerPerson > avgRate ? "↑ Above" : "↓ Below"} average
              </span>
            )}
          </div>
        )}
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

export default SummaryPanel;
