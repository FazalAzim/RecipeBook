'use client';

import React, { useMemo, useState } from 'react';
import { Eye, Users, Activity } from 'lucide-react';

export interface VisitDayPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
}

interface VisitorsAnalyticsPanelProps {
  pageViewsAllTime: number;
  pageViewsToday: number;
  uniqueVisitorsAllTime: number;
  uniqueVisitorsLast7Days: number;
  uniqueVisitorsToday: number;
  series: VisitDayPoint[];
}

type RangeKey = 7 | 14 | 30;

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function niceMax(n: number): number {
  if (n <= 0) return 4;
  const padded = n * 1.15;
  const mag = Math.pow(10, Math.floor(Math.log10(padded)));
  return Math.ceil(padded / mag) * mag;
}

export function VisitorsAnalyticsPanel({
  pageViewsAllTime,
  pageViewsToday,
  uniqueVisitorsAllTime,
  uniqueVisitorsLast7Days,
  uniqueVisitorsToday,
  series,
}: VisitorsAnalyticsPanelProps) {
  const [range, setRange] = useState<RangeKey>(14);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => {
    const slice = series.slice(-range);
    return slice.length > 0 ? slice : Array.from({ length: range }, (_, i) => ({
      date: '',
      pageViews: 0,
      uniqueVisitors: 0,
    })).map((p, i) => ({ ...p, date: `d${i}` }));
  }, [series, range]);

  const maxViews = niceMax(Math.max(...points.map((p) => p.pageViews), 0));
  const maxVisitors = niceMax(Math.max(...points.map((p) => p.uniqueVisitors), 0));

  const chartW = 640;
  const chartH = 220;
  const pad = { top: 20, right: 12, bottom: 32, left: 36 };
  const innerW = chartW - pad.left - pad.right;
  const innerH = chartH - pad.top - pad.bottom;

  const xAt = (i: number) =>
    pad.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yViews = (v: number) => pad.top + innerH - (v / maxViews) * innerH;
  const yVisitors = (v: number) => pad.top + innerH - (v / maxVisitors) * innerH;

  const areaPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yViews(p.pageViews).toFixed(1)}`)
    .join(' ');

  const areaClosed =
    points.length > 0
      ? `${areaPath} L ${xAt(points.length - 1).toFixed(1)} ${(pad.top + innerH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`
      : '';

  const linePath = areaPath;

  const barW = Math.max(6, (innerW / Math.max(points.length, 1)) * 0.45);
  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  const rangeTotalViews = points.reduce((s, p) => s + p.pageViews, 0);
  const rangeTotalVisitors = points.reduce((s, p) => s + p.uniqueVisitors, 0);

  return (
    <section
      className="surface-card"
      style={{
        padding: '1.5rem',
        marginBottom: '2.5rem',
        background:
          'linear-gradient(160deg, rgba(240,106,34,0.08) 0%, var(--bg-surface) 42%, rgba(74,222,128,0.05) 100%)',
        border: '1px solid var(--border-subtle, #2E2825)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Activity size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Visitor analytics</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Page views and unique visitors over time
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            padding: '0.25rem',
            borderRadius: '999px',
            background: 'var(--bg-subtle)',
            border: '1px solid #2E2825',
            gap: '0.15rem',
          }}
        >
          {([7, 14, 30] as RangeKey[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '0.4rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: range === r ? 'var(--primary)' : 'transparent',
                color: range === r ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <Kpi
          icon={<Eye size={16} />}
          label="Views today"
          value={pageViewsToday}
          hint={`All-time ${pageViewsAllTime}`}
          accent="var(--primary)"
        />
        <Kpi
          icon={<Users size={16} />}
          label="Visitors today"
          value={uniqueVisitorsToday}
          hint={`7d ${uniqueVisitorsLast7Days} · All-time ${uniqueVisitorsAllTime}`}
          accent="var(--accent-olive)"
        />
        <Kpi
          icon={<Eye size={16} />}
          label={`${range}d views`}
          value={rangeTotalViews}
          hint="Selected range"
          accent="var(--primary)"
        />
        <Kpi
          icon={<Users size={16} />}
          label={`${range}d visitor-days`}
          value={rangeTotalVisitors}
          hint="Sum of daily uniques"
          accent="var(--accent-olive)"
        />
      </div>

      <div style={{ position: 'relative' }}>
        {hovered && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 2,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(26,22,19,0.92)',
              border: '1px solid #3A322C',
              fontSize: '0.8125rem',
              pointerEvents: 'none',
              minWidth: '140px',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{formatShortDate(hovered.date)}</div>
            <div style={{ color: 'var(--primary)' }}>Views: {hovered.pageViews}</div>
            <div style={{ color: 'var(--accent-olive)' }}>Visitors: {hovered.uniqueVisitors}</div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          width="100%"
          height="240"
          role="img"
          aria-label="Visitor traffic chart"
          style={{ display: 'block' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F06A22" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F06A22" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = pad.top + innerH * (1 - t);
            return (
              <g key={t}>
                <line
                  x1={pad.left}
                  x2={chartW - pad.right}
                  y1={y}
                  y2={y}
                  stroke="#2E2825"
                  strokeDasharray={t === 0 ? undefined : '3 5'}
                />
                <text x={pad.left - 8} y={y + 3} textAnchor="end" fill="#8A7F76" fontSize="10">
                  {Math.round(maxViews * t)}
                </text>
              </g>
            );
          })}

          {/* Visitor bars (secondary scale) */}
          {points.map((p, i) => {
            const x = xAt(i) - barW / 2;
            const h = (p.uniqueVisitors / maxVisitors) * innerH;
            const y = pad.top + innerH - h;
            return (
              <rect
                key={`bar-${p.date}`}
                x={x}
                y={y}
                width={barW}
                height={Math.max(h, 0)}
                rx={3}
                fill="url(#barFill)"
                opacity={hoverIndex == null || hoverIndex === i ? 1 : 0.35}
              />
            );
          })}

          {/* Page views area + line */}
          {areaClosed && <path d={areaClosed} fill="url(#viewsFill)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#F06A22"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {points.map((p, i) => (
            <circle
              key={`dot-${p.date}`}
              cx={xAt(i)}
              cy={yViews(p.pageViews)}
              r={hoverIndex === i ? 5 : 3}
              fill="#F06A22"
              stroke="#1A1613"
              strokeWidth="2"
            />
          ))}

          {/* X labels */}
          {points.map((p, i) => {
            const show =
              points.length <= 8 ||
              i === 0 ||
              i === points.length - 1 ||
              i % Math.ceil(points.length / 6) === 0;
            if (!show) return null;
            return (
              <text
                key={`lbl-${p.date}`}
                x={xAt(i)}
                y={chartH - 10}
                textAnchor="middle"
                fill="#8A7F76"
                fontSize="10"
              >
                {formatShortDate(p.date)}
              </text>
            );
          })}

          {/* Hit areas */}
          {points.map((p, i) => (
            <rect
              key={`hit-${p.date}`}
              x={xAt(i) - innerW / points.length / 2}
              y={pad.top}
              width={innerW / points.length}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}
        </svg>

        <div
          style={{
            display: 'flex',
            gap: '1.25rem',
            flexWrap: 'wrap',
            marginTop: '0.25rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          <LegendDot color="#F06A22" label="Page views" />
          <LegendDot color="#4ADE80" label="Unique visitors / day" />
        </div>
      </div>
    </section>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  accent: string;
}) {
  return (
    <div
      style={{
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(16,14,12,0.55)',
        border: '1px solid #2E2825',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: accent, marginBottom: '0.35rem' }}>
        {icon}
        <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em' }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{hint}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
      {label}
    </span>
  );
}
