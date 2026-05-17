"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHistory, deleteHistoryEntry, clearHistory } from "@/lib/storage";
import type { HistoryEntry } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function bandColor(score: number): string {
  if (score >= 14) return "text-score-green";
  if (score >= 11) return "text-score-amber";
  return "text-score-red";
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setEntries(getHistory());
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-2 border-black/[0.04] border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto px-8 pt-10 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-ink">
              历史记录
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              共 {entries.length} 篇批改记录
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="btn-ghost text-sm"
            >
              批改新作文
            </button>
            {entries.length > 0 && (
              confirmClear ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      clearHistory();
                      setEntries([]);
                      setConfirmClear(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-score-red rounded-xl hover:bg-red-700 transition-colors"
                  >
                    确认清空
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-4 py-2 text-sm font-medium text-ink-muted border border-surface-border rounded-xl hover:bg-black/[0.03] transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="btn-ghost text-sm text-score-red hover:border-score-red/30 hover:bg-red-50"
                >
                  清空记录
                </button>
              )
            )}
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <svg className="w-16 h-16 text-ink-muted/20 mx-auto mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3 className="text-lg font-heading font-medium text-ink mb-2">
              暂无批改记录
            </h3>
            <p className="text-sm text-ink-muted mb-8">
              提交你的第一篇作文，开始提分之旅
            </p>
            <button
              onClick={() => router.push("/")}
              className="btn-gold px-12 !w-auto inline-flex"
            >
              开始批改
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="card group hover:border-gold/20 transition-colors duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      {/* 题目 + 日期 */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-heading font-semibold text-ink truncate">
                          {entry.topic || "无题目"}
                        </h3>
                        <span className="text-xs text-ink-muted flex-shrink-0">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>

                      {/* 作文预览 */}
                      <p className="text-sm text-ink-light line-clamp-2 leading-relaxed mb-3">
                        {entry.essay.slice(0, 200)}
                        {entry.essay.length > 200 && "..."}
                      </p>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            sessionStorage.setItem("gradeResult", JSON.stringify(entry.result));
                            sessionStorage.setItem("originalEssay", entry.essay);
                            sessionStorage.setItem("essayTopic", entry.topic);
                            router.push("/result");
                          }}
                          className="text-xs font-medium text-gold-dark hover:text-gold transition-colors px-3 py-1.5 rounded-lg bg-gold/[0.06] hover:bg-gold/[0.1]"
                        >
                          查看详情
                        </button>
                        <button
                          onClick={() => {
                            deleteHistoryEntry(entry.id);
                            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
                          }}
                          className="text-xs text-ink-muted hover:text-score-red transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                        >
                          删除
                        </button>
                      </div>
                    </div>

                    {/* 分数圆环 */}
                    <div className="flex-shrink-0 text-center">
                      <div className={`text-3xl font-heading font-bold ${bandColor(entry.result.score)}`}>
                        {entry.result.score}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        / 14
                      </div>
                      <div className={`text-[11px] mt-1 font-medium ${bandColor(entry.result.score)}`}>
                        {entry.result.band}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
