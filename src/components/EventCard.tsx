import { forwardRef } from "react";
import type { EventData } from "@/data/mockEvents";

interface EventCardProps {
  event: EventData;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  tentative: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
};

export const EventCard = forwardRef<HTMLDivElement, EventCardProps>(({ event }, ref) => {
  const subtotal = event.pax * event.ratePerPerson;
  const taxAmount = event.taxPercent ? subtotal * (event.taxPercent / 100) : 0;
  const grandTotal = subtotal + taxAmount;
  const balance = event.advanceAmount ? grandTotal - event.advanceAmount : grandTotal;
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
            {/* Event title */}
            <h1 style={{ color: "#FFFFFF", fontSize: "48px", fontWeight: 800, lineHeight: 1.1, margin: 0, letterSpacing: "-0.5px" }}>
              {event.title}
            </h1>
            {event.hallName && (
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "20px", marginTop: "10px", fontWeight: 400 }}>
                📍 {event.hallName}
              </p>
            )}
          </div>

          {/* Status badge */}
          <div style={{
            background: sc.bg,
            color: sc.text,
            border: `2px solid ${sc.border}`,
            borderRadius: "12px",
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            marginLeft: "24px",
            marginTop: "4px",
          }}>
            {event.status === "confirmed" ? "✓ Confirmed" : event.status === "cancelled" ? "✕ Cancelled" : "⏳ Tentative"}
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
            <p style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{event.startTime} – {event.endTime}</p>
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

        {/* Customer & Staff row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <InfoCard icon="👤" label="Customer Name" value={event.customerName} />
          <InfoCard icon="📞" label="Contact" value={event.customerPhone || "—"} />
          {event.customerEmail && <InfoCard icon="✉️" label="Email" value={event.customerEmail} />}
          {event.assignedStaff && <InfoCard icon="🧑‍🍳" label="Assigned Staff" value={event.assignedStaff} />}
        </div>

        {/* Schedule */}
        {event.services.length > 0 && (
          <CardSection title="Event Schedule" icon="🗓️">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {event.services.map((s, i) => (
                <div key={i} style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "#1E1B4B" }}>{s.name}</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#7C3AED", background: "#EDE9FE", padding: "4px 12px", borderRadius: "20px" }}>{s.time}</span>
                </div>
              ))}
            </div>
          </CardSection>
        )}

        {/* Menu */}
        {Object.keys(event.menuItems).length > 0 && (
          <CardSection title="Menu Details" icon="🍽️">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {Object.entries(event.menuItems).map(([service, items]) => (
                <div key={service} style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>{service}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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

        {/* Pricing */}
        <CardSection title="Pricing Summary" icon="💰">
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
            <PriceRow label={`Rate per person (₹${event.ratePerPerson.toLocaleString("en-IN")})`} value={`₹${subtotal.toLocaleString("en-IN")}`} sub={`${event.pax} guests × ₹${event.ratePerPerson}`} />
            {event.taxPercent ? (
              <PriceRow label={`GST / Tax`} value={`₹${taxAmount.toLocaleString("en-IN")}`} sub={`${event.taxPercent}% of subtotal`} />
            ) : null}
            {event.advanceAmount ? (
              <PriceRow label="Advance Received" value={`₹${event.advanceAmount.toLocaleString("en-IN")}`} sub="Paid" positive />
            ) : null}
            {/* Grand total */}
            <div style={{
              background: "linear-gradient(135deg, #4C1D95, #7C3AED)",
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>Grand Total</p>
                <p style={{ color: "#FFFFFF", fontSize: "28px", fontWeight: 800, marginTop: "2px" }}>₹{grandTotal.toLocaleString("en-IN")}</p>
              </div>
              {event.advanceAmount ? (
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>Balance Due</p>
                  <p style={{ color: balance > 0 ? "#FCD34D" : "#6EE7B7", fontSize: "24px", fontWeight: 800, marginTop: "2px" }}>
                    ₹{Math.abs(balance).toLocaleString("en-IN")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </CardSection>

        {/* Notes */}
        {event.notes && (
          <CardSection title="Special Notes" icon="📝">
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

const InfoCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div style={{
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  }}>
    <span style={{ fontSize: "20px", lineHeight: 1 }}>{icon}</span>
    <div>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "1.5px" }}>{label}</p>
      <p style={{ fontSize: "17px", fontWeight: 700, color: "#1E1B4B", marginTop: "4px" }}>{value}</p>
    </div>
  </div>
);

const CardSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
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
