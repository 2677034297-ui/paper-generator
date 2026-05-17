"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScoreCard from "@/components/ScoreCard";
import GrammarSection from "@/components/GrammarSection";
import ExpressionUpgrade from "@/components/ExpressionUpgrade";
import StructureAnalysis from "@/components/StructureAnalysis";
import UpgradedVersion from "@/components/UpgradedVersion";
import { saveToHistory } from "@/lib/storage";
import type { GradeResult } from "@/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GradeResult | null>(null);
  const [originalEssay, setOriginalEssay] = useState("");
  const [topic, setTopic] = useState("");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("gradeResult");
    const essay = sessionStorage.getItem("originalEssay");
    const t = sessionStorage.getItem("essayTopic");

    if (!stored || !essay) {
      setNotFound(true);
      return;
    }

    const parsed: GradeResult = JSON.parse(stored);
    setResult(parsed);
    setOriginalEssay(essay);
    setTopic(t || "");

    // 保存到历史记录
    const id = saveToHistory(essay, t || "", parsed);
    setHistoryId(id);
  }, []);

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-24 text-center animate-fade-in">
        <div className="glass-card p-12">
          <svg className="w-16 h-16 text-ink-muted/30 mx-auto mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <h2 className="text-xl font-heading font-semibold text-ink mb-3">
            未找到批改结果
          </h2>
          <p className="text-ink-muted mb-8">
            批改结果已过期，请返回首页重新提交作文
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-gold px-10 !w-auto inline-flex"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-2 border-black/[0.04] border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* 顶部信息条 */}
      <div className="max-w-4xl mx-auto px-8 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-ink">
              批改结果
            </h1>
            {topic && (
              <p className="text-sm text-ink-muted mt-1">
                题目：{topic}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="btn-ghost text-sm"
            >
              批改新作文
            </button>
            <button
              onClick={() => router.push("/history")}
              className="btn-ghost text-sm"
            >
              历史记录
            </button>
          </div>
        </div>
      </div>

      {/* 原始作文 */}
      <section className="max-w-4xl mx-auto px-8 mb-6">
        <div className="card">
          <div className="card-header">
            <svg className="w-4 h-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h2 className="font-heading font-semibold text-ink text-sm">你的原文</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-ink-light leading-relaxed whitespace-pre-wrap">
              {originalEssay}
            </p>
          </div>
        </div>
      </section>

      {/* 分数卡片 */}
      <section className="max-w-4xl mx-auto px-8 mb-6">
        <ScoreCard
          score={result.score}
          band={result.band}
          distanceToNext={result.distance_to_next_band}
          dimensionScores={result.dimension_scores}
          overallComment={result.overall_comment}
        />
      </section>

      {/* 语法错误 */}
      {result.grammar_errors.length > 0 && (
        <section className="max-w-4xl mx-auto px-8 mb-6">
          <GrammarSection errors={result.grammar_errors} />
        </section>
      )}

      {/* 高分表达升级 */}
      {result.advanced_expressions.length > 0 && (
        <section className="max-w-4xl mx-auto px-8 mb-6">
          <ExpressionUpgrade expressions={result.advanced_expressions} />
        </section>
      )}

      {/* 结构分析 */}
      <section className="max-w-4xl mx-auto px-8 mb-6">
        <StructureAnalysis feedback={result.structure_feedback} />
      </section>

      {/* 一键升档 */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <UpgradedVersion
          originalEssay={originalEssay}
          improvedVersion11={result.improved_version_11}
          improvedVersion14={result.improved_version_14}
          historyId={historyId}
        />
      </section>
    </div>
  );
}
