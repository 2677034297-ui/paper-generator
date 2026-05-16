"use client";

import { useState } from "react";

interface Props {
  onSubmit: (essay: string, topic: string) => void;
}

export default function EssayInput({ onSubmit }: Props) {
  const [essay, setEssay] = useState("");
  const [topic, setTopic] = useState("");

  const wordCount = essay
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const canSubmit = essay.trim().length >= 30;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(essay.trim(), topic.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* 毛玻璃卡片 */}
      <div className="glass-card p-8">
        {/* 题目 */}
        <div className="mb-5">
          <label
            htmlFor="essay-topic"
            className="block text-[13px] font-medium text-ink mb-2"
          >
            作文题目{" "}
            <span className="text-ink-muted font-normal">（选填）</span>
          </label>
          <input
            id="essay-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：On the Importance of Teamwork"
            className="w-full px-5 py-3.5 border border-surface-border rounded-2xl
                       bg-white/60 text-ink placeholder:text-ink-muted/40 text-[15px]
                       focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/40
                       transition-all duration-300"
          />
        </div>

        {/* 作文正文 */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="essay-content"
              className="block text-[13px] font-medium text-ink"
            >
              作文正文
            </label>
            <span
              className={`text-xs tabular-nums ${
                essay.length > 0 && !canSubmit
                  ? "text-score-red"
                  : "text-ink-muted"
              }`}
              aria-live="polite"
            >
              {wordCount} 词
              {essay.length > 0 && !canSubmit && "（至少 30 词）"}
            </span>
          </div>
          <textarea
            id="essay-content"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder={`在这里输入你的英语作文...

Nowadays, an increasing number of college students are facing various pressures.

Some feel stressed about their academic performance, while others worry about
their future career prospects. In my opinion, maintaining a balanced lifestyle
is essential for college students...`}
            rows={14}
            className="w-full px-5 py-4 border border-surface-border rounded-2xl
                       bg-white/60 text-ink placeholder:text-ink-muted/40
                       text-[15px] leading-[32px]
                       focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/40
                       transition-all duration-300 resize-y min-h-[320px]
                       essay-paper font-body"
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-gold flex items-center justify-center gap-2"
        >
          提交批改
        </button>
        <p className="text-center text-[12px] text-ink-muted/60 mt-3">
          AI 阅卷老师将为你详细批改
        </p>
      </div>
    </form>
  );
}
