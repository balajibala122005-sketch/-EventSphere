import React from "react";

// Accessible, zero-dependency SVG Bar Chart
export function AdminBarChart({ data, xKey, yKey, height = 240, color = "#635BFF" }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: "13px" }}>
        No data points available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => Number(d[yKey]) || 0), 1);
  const chartHeight = height - 40;

  return (
    <div className="admin-chart-wrapper" style={{ width: "100%", height }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: chartHeight, paddingBottom: "10px", borderBottom: "1px solid #E2E8F0" }}>
        {data.map((item, index) => {
          const val = Number(item[yKey]) || 0;
          const pct = Math.max((val / maxValue) * 100, 4);

          return (
            <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
                {typeof val === "number" && val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : val}
              </span>
              <div
                style={{
                  width: "100%",
                  maxWidth: "42px",
                  height: `${pct}%`,
                  backgroundColor: color,
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.3s ease",
                }}
                title={`${item[xKey]}: ${val}`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px" }}>
        {data.map((item, index) => (
          <span key={index} style={{ flex: 1, textAlign: "center", fontSize: "11px", color: "#64748B", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item[xKey]}
          </span>
        ))}
      </div>
    </div>
  );
}

// Progress distribution bar
export function DistributionBar({ segments, height = 12 }) {
  const total = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 1;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", width: "100%", height, borderRadius: "6px", overflow: "hidden", backgroundColor: "#F1F5F9" }}>
        {segments.map((seg, i) => {
          const pct = ((Number(seg.value) || 0) / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={i}
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color || "#635BFF",
                transition: "width 0.3s ease",
              }}
              title={`${seg.label}: ${seg.value} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "10px" }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: seg.color }} />
            <span>{seg.label}:</span>
            <strong style={{ color: "#0F172A" }}>{seg.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
