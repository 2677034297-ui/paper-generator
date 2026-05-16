"use client";

import { useState } from "react";
import { updateHistoryUpgrade } from "@/lib/storage";

interface Props {
  originalEssay: string;
  improvedVersion11: string;
  improvedVersion14: string;
  historyId: string | null;
}

type Band = "11" | "14";

export default function UpgradedVersion({
  originalEssay,
  improvedVersion11,
  improvedVersion14,
  historyId,
}: Props) {
  const [activeTab, setActiveTab] = useState<Band>("11");
  const [versions, setVersions] = useState({
    "11": improvedVersion11,
    "14": improvedVersion14,
  });
  const [loading, setLoading] = useState<Band | null>(null);
  const [error, setError] = useState("");

  const handleUpgrade = async (targetBand: Band) => {
    if (versions[targetBand]) {
      setActiveTab(targetBand);
      return;
    }

    setLoading(targetBand);
    setError("");

    try {
      const response = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay: originalEssay,
          target_band: targetBand,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "升档失败");
      }

      const data = await response.json();
      setVersions((prev) => ({
        ...prev,
        [targetBand]: data.improved_version,
      }));

      // 同步到历史记录
      if (historyId) {
        updateHistoryUpgrade(historyId, targetBand, data.improved_version);
      }

      setActiveTab(targetBand);
    } catch (e: any) {
      setError(e.message || "网络错误");
    } finally {
      setLoading(null);
    }
  };

  const currentVersion = activeTab === "11" ? versions["11"] : versions["14"];
  const isLoading = loading === activeTab;

  return (
    <section className="card">
      <div className="card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gold"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <h2 className="font-heading font-semibold text-ink">一键升档</h2>
        </div>

        <nav className="flex gap-1 bg-surface-off rounded-lg p-1" role="tablist">
          {(["11", "14"] as Band[]).map((band) => (
            <button
              key={band}
              role="tab"
              aria-selected={activeTab === band}
              onClick={() => handleUpgrade(band)}
              disabled={loading !== null}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${
                activeTab === band
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              } disabled:opacity-50`}
            >
              {loading === band ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-surface-border border-t-gold rounded-full animate-spin" />
                  生成中
                </span>
              ) : versions[band] ? (
                `${band} 分版`
              ) : (
                `升级到 ${band} 分`
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-14 text-ink-muted text-sm">
            <div className="w-5 h-5 border-2 border-surface-border border-t-gold rounded-full animate-spin mr-3" />
            正在生成 {activeTab} 分版本...
          </div>
        ) : currentVersion ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-ink-muted bg-surface-off px-2.5 py-1 rounded-md tracking-wide">
                {activeTab} 分档改写版
              </span>
            </div>
            <div className="bg-surface-off rounded-xl p-6 border border-surface-border/60 paper-texture">
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap font-body">
                {currentVersion}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-ink-muted text-sm">
            点击上方「升级到 11 分」或「升级到 14 分」按钮
            <br />
            查看改写后的高分版本
          </div>
        )}
      </div>
    </section>
  );
}
