import { forwardRef } from "react";
import type { EventData } from "@/data/mockEvents";
import { fmt12 } from "@/lib/utils";

interface EventCardProps {
  event: EventData;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" },
  confirmed: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  tentative: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
};

export const EventCard = forwardRef<HTMLDivElement, EventCardProps>(({ event }, ref) => {
  // HIDDEN (temporary): pricing calculations
  // const subtotal = event.pax * event.ratePerPerson;
  // const taxAmount = event.taxPercent ? subtotal * (event.taxPercent / 100) : 0;
  // const grandTotal = subtotal + taxAmount;
  // const balance = event.advanceAmount ? grandTotal - event.advanceAmount : grandTotal;
  const sc = statusColors[event.status] || statusColors.tentative;

  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        minHeight: "1400px",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: "#F8F7FF",
        color: "#1E1B4B",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── TOP ACCENT BAR ── */}
      <div style={{ height: "6px", background: "linear-gradient(90deg, #7C3AED, #A78BFA, #7C3AED)" }} />

      {/* ── HEADER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)",
          padding: "48px 56px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -60, right: 80, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div style={{ flex: 1 }}>
            {/* Company name */}
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px" }}>
              Royal Banquets &amp; Events
            </p>
            {/* Event title + status on same line */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <h1 style={{ color: "#FFFFFF", fontSize: "48px", fontWeight: 800, lineHeight: 1.1, margin: 0, letterSpacing: "-0.5px" }}>
                {event.title}
              </h1>
              {/* Status badge — inline with title */}
              <div style={{
                background: sc.bg,
                color: sc.text,
                border: `2px solid ${sc.border}`,
                borderRadius: "8px",
                padding: "6px 18px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                alignSelf: "center",
              }}>
                {event.status === "draft" ? "Draft" : event.status === "confirmed" ? "Confirmed" : event.status === "cancelled" ? "Cancelled" : "Tentative"}
              </div>
            </div>
            {event.hallName && (
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "20px", marginTop: "10px", fontWeight: 400 }}>
                {event.hallName}
              </p>
            )}
          </div>
        </div>

        {/* Date & time strip */}
        <div style={{
          marginTop: "32px",
          background: "rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "16px 24px",
          display: "flex",
          gap: "48px",
          alignItems: "center",
        }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Date</p>
            <p style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{formattedDate}</p>
          </div>
          <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.2)" }} />
          <div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Time</p>
            <p style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{fmt12(event.startTime)} – {fmt12(event.endTime)}</p>
          </div>
          <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.2)" }} />
          <div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Guests</p>
            <p style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{event.pax} PAX</p>
          </div>
          {event.occasion && (
            <>
              <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.2)" }} />
              <div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Occasion</p>
                <p style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{event.occasion}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, padding: "40px 56px", display: "flex", flexDirection: "column", gap: "32px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <InfoCard label="Customer Name" value={event.customerName} />
          <InfoCard label="Contact" value={event.customerPhone || "—"} />
          {event.customerEmail && (
            <div style={{ gridColumn: "1 / -1" }}>
              <InfoCard label="Email" value={event.customerEmail} />
            </div>
          )}
        </div>

        {/* Extras */}
        {(event.selectedExtras ?? []).length > 0 && (
          <CardSection title="Extras & Add-ons">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {(event.selectedExtras ?? []).map((extra, i) => {
                const name = typeof extra === "string" ? extra : extra.name;
                const qty = typeof extra === "string" ? 1 : extra.quantity;
                return (
                  <div key={i} style={{
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: "10px",
                    padding: "10px 18px",
                    color: "#1E40AF",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}>
                    {name}{qty > 1 && ` x ${qty}`}
                  </div>
                );
              })}
            </div>
          </CardSection>
        )}

        {/* Schedule */}
        {event.services.length > 0 && (
          <CardSection title="Event Schedule">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {event.services.map((s, i) => (
                <div key={i} style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "10px",
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "#1E1B4B" }}>{s.name}</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#7C3AED", background: "#EDE9FE", padding: "4px 14px", borderRadius: "20px", whiteSpace: "nowrap", marginLeft: "12px" }}>{fmt12(s.time)}</span>
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Menu */}
        {Object.keys(event.menuItems).length > 0 && (
          <CardSection title="Menu Details">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {Object.entries(event.menuItems).map(([service, items]) => (
                <div key={service} style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>{service}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-start", alignItems: "center" }}>
                    {items.map((item, i) => (
                      <span key={i} style={{
                        background: "#F5F3FF",
                        color: "#4C1D95",
                        border: "1px solid #DDD6FE",
                        borderRadius: "20px",
                        padding: "4px 14px",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* HIDDEN (temporary): Pricing Summary section (revenue/payment) */}
        {/* <CardSection title="Pricing Summary" icon="💰"> ... </CardSection> */}

        {/* Notes */}
        {event.notes && (
          <CardSection title="Special Notes">
            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "16px 20px" }}>
              <p style={{ fontSize: "15px", color: "#78350F", lineHeight: 1.6 }}>{event.notes}</p>
            </div>
          </CardSection>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: "linear-gradient(135deg, #4C1D95, #6D28D9)",
        padding: "28px 56px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <p style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700 }}>Royal Banquets &amp; Events</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "4px" }}>Creating Memorable Experiences Since 2010</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>Document generated</p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginTop: "2px" }}>
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── BOTTOM ACCENT BAR ── */}
      <div style={{ height: "6px", background: "linear-gradient(90deg, #7C3AED, #A78BFA, #7C3AED)" }} />
    </div>
  );
});

EventCard.displayName = "EventCard";

// ── Sub-components ──

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    padding: "16px 20px",
  }}>
    <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "1.5px" }}>{label}</p>
    <p style={{ fontSize: "17px", fontWeight: 700, color: "#1E1B4B", marginTop: "4px" }}>{value}</p>
  </div>
);

const CardSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1E1B4B", margin: 0 }}>{title}</h3>
      <div style={{ flex: 1, height: "1px", background: "#E5E7EB", marginLeft: "8px" }} />
    </div>
    {children}
  </div>
);

const PriceRow = ({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 24px",
    borderBottom: "1px solid #F3F4F6",
  }}>
    <div>
      <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>{label}</p>
      {sub && <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{sub}</p>}
    </div>
    <p style={{ fontSize: "17px", fontWeight: 700, color: positive ? "#059669" : "#1E1B4B" }}>{value}</p>
  </div>
);
