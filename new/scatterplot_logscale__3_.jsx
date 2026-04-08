import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Customized,
} from "recharts";

const gptXhighTools = 78.26;
const gptXhighLLM = 68.42;

const data = [
  // LLM + Tools (square)
  { name: "Kimi-K2.5", params: 1024, overall: 70.89, tokens: 6413.1, category: "tools" },
  { name: "DeepSeek-V3.2", params: 685, overall: 73.16, tokens: 3011.5, category: "tools" },
  { name: "GLM-4.6", params: 357, overall: 60.69, tokens: 3580.4, category: "tools" },
  { name: "Qwen3-235B-A22B-Thinking-2507", params: 235, overall: 57.00, tokens: 6467.4, category: "tools" },
  { name: "GPT-OSS-120B-high", params: 120, overall: 60.31, tokens: 2700.4, category: "tools" },
  { name: "Qwen3-30B-A3B-Thinking-2507", params: 30, overall: 53.12, tokens: 5410.1, category: "tools" },
  { name: "Qwen3-8B", params: 8, overall: 46.47, tokens: 3932.5, category: "tools" },
  // Black-Box Agentic LLM (triangle)
  { name: "Tongyi-DeepResearch", params: 30, overall: 60.64, tokens: 7431.8, category: "blackbox" },
  { name: "MiroThinker-v1.5-30B", params: 30, overall: 74.21, tokens: 11295.2, category: "blackbox" },
  { name: "WebSailor-32B", params: 32, overall: 51.85, tokens: 1055.2, category: "blackbox" },
  { name: "WebSailor-7B", params: 7, overall: 32.76, tokens: 2211.5, category: "blackbox" },
  { name: "ASearcher-Web-QWQ-v2", params: 32, overall: 59.25, tokens: 116752.9, category: "blackbox" },
  { name: "ASearcher-Web-7B", params: 7, overall: 24.46, tokens: 601.4, category: "blackbox" },
  { name: "WebExplorer-8B", params: 8, overall: 54.66, tokens: 3616.9, category: "blackbox" },
  { name: "SimpleTIR-32B", params: 32, overall: 38.63, tokens: 5174.8, category: "blackbox" },
  { name: "SimpleTIR-7B", params: 7, overall: 30.85, tokens: 3551.7, category: "blackbox" },
  // Adaptive Agentic LLM (diamond)
  { name: "A2FM", params: 32, overall: 51.39, tokens: 23424.8, category: "adaptive" },
  { name: "AFM-Web-7B-RL", params: 7, overall: 27.46, tokens: 2608.6, category: "adaptive" },
  { name: "AFM-Code-7B-RL", params: 7, overall: 28.92, tokens: 11205.5, category: "adaptive" },
  // Self-Regulated Agentic LLM (hexagon)
  { name: "SRAM-v1.0-30B", params: 30, overall: 71.33, tokens: 5517.7, category: "self" },
  { name: "SRAM-v0.1-8B", params: 8, overall: 56.98, tokens: 3697.6, category: "self" },
  // Reasoning LLM (circle, grey)
  { name: "DeepSeek-V3.2 (text-only)", params: 685, overall: 62.80, tokens: 9306.2, category: "textonly" },
  { name: "Qwen3-30B-A3B-Thinking-2507 (text-only)", params: 30, overall: 52.63, tokens: 8269.1, category: "textonly" },
  { name: "K2-Think-V2-high (text-only)", params: 73, overall: 55.29, tokens: 31905.2, category: "textonly" },
];

const uniqueParams = [...new Set(data.map((d) => d.params))].sort((a, b) => a - b);

// Discrete token bins
const tokenBins = [
  { label: "<3K",     max: 3000,    color: "#1e9e6d" },  // deep green
  { label: "3K–6K",   max: 6000,    color: "#6ec07a" },  // green (SRAM lives here)
  { label: "6K–9K",   max: 9000,    color: "#e4b832" },  // yellow (Tongyi-DR)
  { label: ">9K",     max: Infinity, color: "#c43e3e" },  // red (MiroThinker+)
];

function tokenColor(tokens) {
  for (const bin of tokenBins) {
    if (tokens < bin.max) return bin.color;
  }
  return tokenBins[tokenBins.length - 1].color;
}

const chartData = data.map((d) => ({
  ...d,
  logParams: Math.log10(d.params),
  color: tokenColor(d.tokens),
}));

const logTicks = [1, 2, 3];
const tickLabels = { 1: "10B", 2: "100B", 3: "1T" };

// Regression: use all data points (exclude gpt-5.4-xhigh which isn't in data)
const xs = data.map((d) => Math.log10(d.params));
const ys = data.map((d) => d.overall);
const n = xs.length;
const meanX = xs.reduce((a, b) => a + b, 0) / n;
const meanY = ys.reduce((a, b) => a + b, 0) / n;
const ssXX = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
const ssXY = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
const slope = ssXY / ssXX;
const intercept = meanY - slope * meanX;
const residuals = ys.map((y, i) => y - (slope * xs[i] + intercept));
const stdDev = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / (n - 2));

const labelOffsets = {
  "Kimi-K2.5": { dx: 14, dy: 0, anchor: "start" },
  "DeepSeek-V3.2": { dx: 14, dy: -10, anchor: "start" },
  "GLM-4.6": { dx: 0, dy: -16, anchor: "middle" },
  "Qwen3-235B-A22B-Thinking-2507": { dx: 14, dy: 0, anchor: "start" },
  "GPT-OSS-120B-high": { dx: 0, dy: -16, anchor: "middle" },
  "Qwen3-30B-A3B-Thinking-2507": { dx: 0, dy: -16, anchor: "middle" },
  "Tongyi-DeepResearch": { dx: 0, dy: -16, anchor: "middle" },
  "MiroThinker-v1.5-30B": { dx: 14, dy: -8, anchor: "start" },
  "WebSailor-7B": { dx: 14, dy: -2, anchor: "start" },
  "WebSailor-32B": { dx: 14, dy: 14, anchor: "start" },
  "ASearcher-Web-QWQ-v2": { dx: 0, dy: 16, anchor: "middle" },
  "ASearcher-Web-7B": { dx: 14, dy: 0, anchor: "start" },
  "WebExplorer-8B": { dx: 0, dy: 16, anchor: "middle" },
  "SimpleTIR-32B": { dx: 14, dy: 0, anchor: "start" },
  "SimpleTIR-7B": { dx: 14, dy: 2, anchor: "start" },
  "A2FM": { dx: 0, dy: 16, anchor: "middle" },
  "AFM-Web-7B-RL": { dx: -14, dy: 3, anchor: "end" },
  "AFM-Code-7B-RL": { dx: -14, dy: -3, anchor: "end" },
  "SRAM-v1.0-30B": { dx: 14, dy: 2, anchor: "start" },
  "Qwen3-8B": { dx: 0, dy: 16, anchor: "middle" },
  "SRAM-v0.1-8B": { dx: 0, dy: -18, anchor: "middle" },
  "DeepSeek-V3.2 (text-only)": { dx: 14, dy: 0, anchor: "start" },
  "Qwen3-30B-A3B-Thinking-2507 (text-only)": { dx: -14, dy: 0, anchor: "end" },
  "K2-Think-V2-high (text-only)": { dx: 14, dy: 0, anchor: "start" },
};

// Models in zoom inset — suppress their labels on the main chart
const zoomModelNames = new Set([
  "Qwen3-30B-A3B-Thinking-2507",
  "Qwen3-30B-A3B-Thinking-2507 (text-only)",
  "A2FM",
  "WebSailor-32B",
]);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const catLabels = {
      tools: "LLM + Tools",
      blackbox: "Black-Box Agentic LLM",
      adaptive: "Adaptive Agentic LLM",
      self: "Self-Regulated Agentic LLM",
      textonly: "Reasoning LLM",
    };
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "'DM Sans', sans-serif",
          color: "#2a2a3e",
          fontSize: 14,
          lineHeight: 1.6,
          fontWeight: 500,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{d.name}</div>
        <div><span style={{ color: "#5a7a9e" }}>Type:</span> {catLabels[d.category]}</div>
        <div><span style={{ color: "#5a7a9e" }}>Params:</span> {d.params}B</div>
        <div><span style={{ color: "#5a7a9e" }}>Overall Pass@1:</span> {d.overall.toFixed(2)}</div>
        <div><span style={{ color: "#5a7a9e" }}>Reasoning Tokens:</span> {d.tokens.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

function squarePath(cx, cy, s) {
  return `M${cx - s},${cy - s} L${cx + s},${cy - s} L${cx + s},${cy + s} L${cx - s},${cy + s} Z`;
}
function trianglePath(cx, cy, s) {
  const h = s * 1.15;
  return `M${cx},${cy - h} L${cx + s},${cy + h * 0.6} L${cx - s},${cy + h * 0.6} Z`;
}
function diamondPath(cx, cy, s) {
  const h = s * 1.2;
  return `M${cx},${cy - h} L${cx + s},${cy} L${cx},${cy + h} L${cx - s},${cy} Z`;
}
function hexagonPath(cx, cy, s) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${cx + s * Math.cos(angle)},${cy + s * Math.sin(angle)}`);
  }
  return `M${pts.join(" L")} Z`;
}

export default function App() {
  const [hovered, setHovered] = useState(null);

  const logMin = 0.35;
  const logMax = 3.5;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <h2
        style={{
          color: "#1a1a2e",
          fontWeight: 800,
          fontSize: 20,
          marginBottom: 2,
          letterSpacing: "-0.02em",
        }}
      >
        Overall Pass@1 (↑) vs. Parameter Size (log scale)
      </h2>
      <p style={{ color: "#4a5a6e", fontSize: 14, marginBottom: 4, fontWeight: 500 }}>
        Color encodes reasoning token count — greener is fewer, redder is more
      </p>

      {/* Reasoning Tokens discrete color legend above the chart */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ color: "#5a6a7e", fontSize: 12, fontWeight: 600 }}>Num. Reasoning Tokens (↓)</span>
        {tokenBins.map((bin, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="24" height="14">
              <rect width="24" height="14" rx="3" fill={bin.color} opacity={0.9} />
            </svg>
            <span style={{ color: "#3a4a5e", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              {bin.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 1020 }}>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 16, right: 40, bottom: 36, left: 24 }}>
              {/* Custom grid */}
              <Customized
                component={({ xAxisMap, yAxisMap }) => {
                  if (!xAxisMap || !yAxisMap) return null;
                  const xAxis = Object.values(xAxisMap)[0];
                  const yAxis = Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis) return null;
                  const toX = (v) => xAxis.scale(v);
                  const toY = (v) => yAxis.scale(v);
                  const gridRight = toX(logMax);
                  const gridLeft = toX(logMin);
                  const gridTop = toY(85);
                  const gridBottom = toY(15);
                  const hLines = [20, 30, 40, 50, 60, 70, 80];
                  const vLines = logTicks;
                  return (
                    <g>
                      {hLines.map((v) => (
                        <line key={`h-${v}`} x1={gridLeft} x2={gridRight}
                          y1={toY(v)} y2={toY(v)}
                          stroke="rgba(0,0,0,0.08)" strokeDasharray="3 6" />
                      ))}
                      {vLines.map((v) => (
                        <line key={`v-${v}`} x1={toX(v)} x2={toX(v)}
                          y1={gridTop} y2={gridBottom}
                          stroke="rgba(0,0,0,0.08)" strokeDasharray="3 6" />
                      ))}
                      <line x1={gridLeft} x2={gridRight} y1={gridBottom} y2={gridBottom} stroke="rgba(0,0,0,0.15)" />
                      <line x1={gridRight} x2={gridRight} y1={gridTop} y2={gridBottom} stroke="rgba(0,0,0,0.08)" strokeDasharray="3 6" />
                      <line x1={gridLeft} x2={gridRight} y1={gridTop} y2={gridTop} stroke="rgba(0,0,0,0.08)" strokeDasharray="3 6" />
                    </g>
                  );
                }}
              />
              <XAxis
                type="number"
                dataKey="logParams"
                domain={[logMin, logMax]}
                ticks={logTicks}
                tickFormatter={(v) => tickLabels[v] || ""}
                tick={{ fill: "#3a4a5e", fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={false}
                tickLine={{ stroke: "rgba(0,0,0,0.1)" }}
              >
                <Label value="Parameter Size (log scale)" position="bottom" offset={16}
                  style={{ fill: "#4a5a6e", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} />
              </XAxis>
              <YAxis
                type="number"
                dataKey="overall"
                domain={[15, 85]}
                ticks={[20, 30, 40, 50, 60, 70, 80]}
                tick={{ fill: "#3a4a5e", fontSize: 14, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}
                axisLine={{ stroke: "rgba(0,0,0,0.15)" }}
                tickLine={{ stroke: "rgba(0,0,0,0.1)" }}
                tickFormatter={(v) => v}
              >
                <Label value="Overall Pass@1" angle={-90} position="insideLeft" offset={-8}
                  style={{ fill: "#4a5a6e", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} />
              </YAxis>
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {/* Regression + reference lines */}
              <Customized
                component={({ xAxisMap, yAxisMap }) => {
                  if (!xAxisMap || !yAxisMap) return null;
                  const xAxis = Object.values(xAxisMap)[0];
                  const yAxis = Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis) return null;
                  const toX = (v) => xAxis.scale(v);
                  const toY = (v) => yAxis.scale(v);

                  const steps = 80;
                  const points = [];
                  const bandUpper = [];
                  const bandLower = [];
                  for (let i = 0; i <= steps; i++) {
                    const xVal = logMin + (i / steps) * (logMax - logMin);
                    const yVal = slope * xVal + intercept;
                    const px = toX(xVal);
                    const py = toY(yVal);
                    const pyUp = toY(Math.min(yVal + stdDev, 85));
                    const pyDown = toY(Math.max(yVal - stdDev, 15));
                    if (isFinite(px) && isFinite(py)) {
                      points.push(`${px},${py}`);
                      bandUpper.push(`${px},${pyUp}`);
                      bandLower.push(`${px},${pyDown}`);
                    }
                  }
                  const bandPath = `M${bandUpper.join(" L")} L${bandLower.reverse().join(" L")} Z`;

                  return (
                    <g>
                      <path d={bandPath} fill="rgba(100,130,180,0.1)" stroke="none" />
                      <polyline points={points.join(" ")} fill="none"
                        stroke="rgba(80,110,160,0.4)" strokeWidth={2} />
                      {/* Regression line label */}
                      <text x={toX(logMax) - 4} y={toY(85) + 14}
                        textAnchor="end" fill="#5a6a7e" fontSize={11} fontWeight={600}
                        fontFamily="'DM Sans', sans-serif">
                        Overall Pass@1 vs. log(Parameter Size) trendline (±1σ)
                      </text>
                      {/* gpt-5.4-xhigh LLM + Tools line (red) */}
                      <line x1={toX(logMin)} x2={toX(logMax)}
                        y1={toY(gptXhighTools)} y2={toY(gptXhighTools)}
                        stroke="#cc3333" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7} />
                      <text x={toX(logMin) + 4} y={toY(gptXhighTools) - 8}
                        textAnchor="start" fill="#cc3333" fontSize={11} fontWeight={600}
                        fontFamily="'DM Sans', sans-serif">
                        GPT-5.4-xhigh (LLM + Tools)
                      </text>
                      {/* gpt-5.4-xhigh Reasoning LLM line (orange) */}
                      <line x1={toX(logMin)} x2={toX(logMax)}
                        y1={toY(gptXhighLLM)} y2={toY(gptXhighLLM)}
                        stroke="#dd8822" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7} />
                      <text x={toX(logMin) + 4} y={toY(gptXhighLLM) - 8}
                        textAnchor="start" fill="#dd8822" fontSize={11} fontWeight={600}
                        fontFamily="'DM Sans', sans-serif">
                        GPT-5.4-xhigh (Reasoning LLM)
                      </text>
                    </g>
                  );
                }}
              />
              <Scatter
                data={chartData}
                shape={(props) => {
                  const { cx, cy, payload } = props;
                  const isSRAM = payload.name.startsWith("SRAM");
                  const color = payload.color;
                  const offset = labelOffsets[payload.name] || { dx: 14, dy: 0, anchor: "start" };
                  const s = isSRAM ? 8 : 6.5;

                  let marker;
                  if (payload.category === "textonly") {
                    marker = <circle cx={cx} cy={cy} r={s}
                      fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} opacity={0.8} />;
                  } else if (payload.category === "blackbox") {
                    marker = <path d={trianglePath(cx, cy, s)}
                      fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={1}
                      strokeLinejoin="round" opacity={0.92} />;
                  } else if (payload.category === "adaptive") {
                    marker = <path d={diamondPath(cx, cy, s)}
                      fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={1}
                      strokeLinejoin="round" opacity={0.92} />;
                  } else if (payload.category === "self") {
                    marker = <path d={hexagonPath(cx, cy, s)}
                      fill={color} stroke="#1a1a2e" strokeWidth={2.5}
                      strokeLinejoin="round" opacity={0.92} />;
                  } else {
                    marker = <path d={squarePath(cx, cy, s)}
                      fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={1} opacity={0.92} />;
                  }

                  return (
                    <g
                      onMouseEnter={() => setHovered(payload.name)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {marker}
                      {!zoomModelNames.has(payload.name) && <text
                        x={cx + offset.dx} y={cy + offset.dy}
                        textAnchor={offset.anchor} dominantBaseline="middle"
                        fill={isSRAM ? "#1a1a2e" : "#3a4a5e"}
                        fontSize={isSRAM ? 14 : 12}
                        fontWeight={isSRAM ? 800 : 600}
                        fontFamily="'DM Sans', sans-serif"
                      >
                        {payload.name.replace(" (text-only)", "")}
                      </text>}
                    </g>
                  );
                }}
              />
              {/* Inset zoom panel for crowded 30-32B cluster */}
              <Customized
                component={({ xAxisMap, yAxisMap }) => {
                  if (!xAxisMap || !yAxisMap) return null;
                  const xAxis = Object.values(xAxisMap)[0];
                  const yAxis = Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis) return null;
                  const toX = (v) => xAxis.scale(v);
                  const toY = (v) => yAxis.scale(v);

                  // Source region on main chart (the crowded area)
                  const srcLogMin = 1.42, srcLogMax = 1.55;
                  const srcYMin = 49.5, srcYMax = 55;
                  const sx1 = toX(srcLogMin), sx2 = toX(srcLogMax);
                  const sy1 = toY(srcYMax), sy2 = toY(srcYMin); // y is inverted

                  // Inset panel position (left of legend in lower-right)
                  const legendW = 220;
                  const insetW = 145, insetH = 110;
                  const insetX = toX(logMax) - legendW - insetW - 72;
                  const insetY = toY(15) - insetH - 18;

                  // Zoom models
                  const zoomModels = chartData.filter(d =>
                    d.logParams >= 1.38 && d.logParams <= 1.58 &&
                    d.overall >= 50 && d.overall <= 54.5
                  );

                  // Map from data coords to inset coords
                  const pad = 20;
                  const mapX = (lp) => insetX + pad + ((lp - srcLogMin) / (srcLogMax - srcLogMin)) * (insetW - 2 * pad);
                  const mapY = (ov) => insetY + 16 + ((srcYMax - ov) / (srcYMax - srcYMin)) * (insetH - 32);

                  const mkSize = 6.5;

                  return (
                    <g>
                      {/* Dashed rect on main chart */}
                      <rect x={sx1} y={sy1} width={sx2 - sx1} height={sy2 - sy1}
                        fill="none" stroke="#7088a8" strokeWidth={1} strokeDasharray="4 3" rx={2} />

                      {/* Connector lines from source rect to inset */}
                      <line x1={sx2} y1={sy1} x2={insetX} y2={insetY}
                        stroke="#7088a8" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />
                      <line x1={sx2} y1={sy2} x2={insetX} y2={insetY + insetH}
                        stroke="#7088a8" strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />

                      {/* Inset background */}
                      <rect x={insetX} y={insetY} width={insetW} height={insetH}
                        fill="rgba(248,249,252,0.95)" stroke="#7088a8" strokeWidth={1} rx={4} />

                      {/* Inset Y-axis gridlines */}
                      {[51, 52, 53].map(v => (
                        <g key={`zoom-h-${v}`}>
                          <line x1={insetX + pad} x2={insetX + insetW - pad}
                            y1={mapY(v)} y2={mapY(v)}
                            stroke="rgba(0,0,0,0.06)" strokeDasharray="2 3" />
                        </g>
                      ))}

                      {/* Inset markers and labels */}
                      {zoomModels.map((d, i) => {
                        const cx = mapX(d.logParams);
                        const cy = mapY(d.overall);
                        const isSRAM = d.name.startsWith("SRAM");
                        let marker;
                        if (d.category === "textonly") {
                          marker = <circle cx={cx} cy={cy} r={mkSize}
                            fill={d.color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} opacity={0.8} />;
                        } else if (d.category === "blackbox") {
                          marker = <path d={trianglePath(cx, cy, mkSize)}
                            fill={d.color} stroke="rgba(0,0,0,0.15)" strokeWidth={1}
                            strokeLinejoin="round" opacity={0.92} />;
                        } else if (d.category === "adaptive") {
                          marker = <path d={diamondPath(cx, cy, mkSize)}
                            fill={d.color} stroke="rgba(0,0,0,0.15)" strokeWidth={1}
                            strokeLinejoin="round" opacity={0.92} />;
                        } else if (d.category === "self") {
                          marker = <path d={hexagonPath(cx, cy, mkSize)}
                            fill={d.color} stroke="#1a1a2e" strokeWidth={2.5}
                            strokeLinejoin="round" opacity={0.92} />;
                        } else {
                          marker = <path d={squarePath(cx, cy, mkSize)}
                            fill={d.color} stroke="rgba(0,0,0,0.15)" strokeWidth={1} opacity={0.92} />;
                        }

                        const labelName = d.name.replace(" (text-only)", "");
                        // Specific label positions in zoom panel
                        const zoomOffsets = {
                          "Qwen3-30B-A3B-Thinking-2507 (text-only)": { dx: -10, dy: 0, anchor: "end" },
                          "Qwen3-30B-A3B-Thinking-2507": { dx: 0, dy: -14, anchor: "middle" },
                          "A2FM": { dx: 0, dy: 16, anchor: "middle" },
                          "WebSailor-32B": { dx: 10, dy: 0, anchor: "start" },
                        };
                        const zo = zoomOffsets[d.name] || { dx: 10, dy: 0, anchor: "start" };
                        return (
                          <g key={d.name}>
                            {marker}
                            <text
                              x={cx + zo.dx} y={cy + zo.dy}
                              textAnchor={zo.anchor} dominantBaseline="middle"
                              fill={isSRAM ? "#1a1a2e" : "#3a4a5e"}
                              fontSize={12} fontWeight={600}
                              fontFamily="'DM Sans', sans-serif"
                            >
                              {labelName}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                }}
              />
              {/* System Type legend inside chart - lower right */}
              <Customized
                component={({ xAxisMap, yAxisMap }) => {
                  if (!xAxisMap || !yAxisMap) return null;
                  const xAxis = Object.values(xAxisMap)[0];
                  const yAxis = Object.values(yAxisMap)[0];
                  if (!xAxis || !yAxis) return null;
                  const lx = xAxis.scale(logMax) - 220;
                  const ly = yAxis.scale(15) - 170;
                  return (
                    <foreignObject x={lx} y={ly} width={214} height={170}>
                      <div xmlns="http://www.w3.org/1999/xhtml" style={{
                        background: "rgba(248,249,252,0.92)",
                        borderRadius: 6,
                        border: "1px solid rgba(0,0,0,0.08)",
                        padding: "10px 12px",
                        fontFamily: "'DM Sans', sans-serif",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}>
                        <span style={{ color: "#3a4a5e", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>System Type</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="14" height="14">
                            <polygon points="7,1 12,3.9 12,10.1 7,13 2,10.1 2,3.9" fill="#6aaa8a" stroke="#1a1a2e" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                          <span style={{ color: "#3a4a5e", fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>Self-Regulated Agentic LLM</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="14" height="14"><polygon points="7,0 14,7 7,14 0,7" fill="#6aaa8a" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinejoin="round" /></svg>
                          <span style={{ color: "#3a4a5e", fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>Adaptive Agentic LLM</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="14" height="14"><polygon points="7,1 13,13 1,13" fill="#6aaa8a" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinejoin="round" /></svg>
                          <span style={{ color: "#3a4a5e", fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>Black-Box Agentic LLM</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="14" height="14"><rect x="1" y="1" width="12" height="12" fill="#6aaa8a" stroke="rgba(0,0,0,0.15)" strokeWidth="1" /></svg>
                          <span style={{ color: "#3a4a5e", fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>LLM + Tools</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#6aaa8a" stroke="rgba(0,0,0,0.2)" strokeWidth="1" /></svg>
                          <span style={{ color: "#3a4a5e", fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>Reasoning LLM</span>
                        </div>
                      </div>
                    </foreignObject>
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
