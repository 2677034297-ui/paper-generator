"use client";

import type { AdvancedExpression } from "@/lib/types";

interface Props {
  expressions: AdvancedExpression[];
}

export default function ExpressionUpgrade({ expressions }: Props) {
  return (
    <section className="card">
      {/* Header */}
      <div className="card-header">
        <span className="w-2 h-2 rounded-full bg-score-green flex-shrink-0" aria-hidden="true" />
        <h2 className="font-heading font-semibold text-ink">高分表达升级</h2>
        <span className="text-xs text-ink-muted">
          {expressions.length} 处可优化
        </span>
      </div>

      {/* Expression pairs */}
      <div className="divide-y divide-surface-border">
        {expressions.map((expr, i) => (
          <div key={i} className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Before */}
              <div>
                <div className="text-xs text-ink-muted mb-1.5 font-medium tracking-wide uppercase">
                  普通表达
                </div>
                <p className="text-sm text-ink-light bg-surface-off rounded-lg p-3 border border-surface-border/60 leading-relaxed">
                  {expr.original}
                </p>
              </div>
              {/* After */}
              <div>
                <div className="text-xs text-score-green mb-1.5 font-medium tracking-wide uppercase">
                  高分表达
                </div>
                <p className="text-sm text-ink bg-green-50/50 rounded-lg p-3 border border-green-100 leading-relaxed">
                  {expr.improved}
                </p>
              </div>
            </div>
            {/* Explanation */}
            <p className="text-xs text-ink-muted mt-2.5 leading-relaxed">
              {expr.explanation}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
