"use client";

import { useState } from "react";
import type { GrammarError } from "@/lib/types";

interface Props {
  errors: GrammarError[];
}

export default function GrammarSection({ errors }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    const next = new Set(expanded);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setExpanded(next);
  };

  const toggleAll = () => {
    if (expanded.size === errors.length) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(errors.map((_, i) => i)));
    }
  };

  return (
    <section className="card">
      {/* Header */}
      <div className="card-header">
        {/* 红色圆点指示器 */}
        <span className="w-2 h-2 rounded-full bg-score-red flex-shrink-0" aria-hidden="true" />
        <h2 className="font-heading font-semibold text-ink">语法检查</h2>
        <span className="text-xs text-ink-muted">
          {errors.length} 处需要关注
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="ml-auto text-xs text-ink-muted hover:text-ink transition-colors duration-150 cursor-pointer"
        >
          {expanded.size === errors.length ? "全部收起" : "全部展开"}
        </button>
      </div>

      {/* Error list */}
      <div className="divide-y divide-surface-border">
        {errors.map((err, i) => {
          const isOpen = expanded.has(i);
          return (
            <div key={i} className="px-6 py-3.5">
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full text-left cursor-pointer group"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3">
                  {/* 错误类型标签 */}
                  <span className="text-xs font-medium text-score-red bg-red-50 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">
                    {err.error_type}
                  </span>
                  {/* 原句 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-light line-through decoration-red-300">
                      {err.original}
                    </p>
                    {isOpen && (
                      <div className="mt-3 space-y-2.5 animate-slide-up">
                        {/* 修改建议 */}
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-score-green flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          <p className="text-sm text-score-green font-medium">
                            {err.correction}
                          </p>
                        </div>
                        {/* 老师点评 */}
                        <div className="bg-gold/5 rounded-lg p-3 border border-gold/10">
                          <p className="text-xs text-ink-light leading-relaxed">
                            <span className="font-semibold text-gold-dark">
                              老师点评：
                            </span>
                            {err.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 展开指示 */}
                  <svg
                    className={`w-4 h-4 text-ink-muted flex-shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
