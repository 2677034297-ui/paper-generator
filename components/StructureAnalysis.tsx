"use client";

import type { StructureFeedback } from "@/lib/types";

interface Props {
  feedback: StructureFeedback;
}

const SECTIONS: { key: keyof StructureFeedback; label: string }[] = [
  { key: "opening", label: "开头" },
  { key: "body", label: "主体" },
  { key: "conclusion", label: "结尾" },
  { key: "coherence", label: "连贯性" },
];

export default function StructureAnalysis({ feedback }: Props) {
  return (
    <section className="card">
      {/* Header */}
      <div className="card-header">
        <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" aria-hidden="true" />
        <h2 className="font-heading font-semibold text-ink">结构分析</h2>
      </div>

      {/* Grid: 2x2 */}
      <div className="grid grid-cols-2 divide-x divide-surface-border">
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="p-5">
            <h3 className="text-sm font-heading font-medium text-ink mb-2">
              {label}
            </h3>
            <p className="text-sm text-ink-light leading-relaxed">
              {feedback[key] || "暂无评价"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
