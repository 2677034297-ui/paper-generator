"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "正在阅读你的作文...",
  "分析切题度和内容完整度...",
  "检查语法和句式结构...",
  "查找可升级的表达...",
  "生成阅卷老师点评...",
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center py-32 animate-fade-in"
      role="status"
      aria-label="正在批改作文"
    >
      {/* 金色旋转圈 */}
      <div className="relative mb-8">
        <div className="w-14 h-14 rounded-full border-2 border-black/[0.04] border-t-gold animate-spin" />
        <svg
          className="absolute inset-0 m-auto w-6 h-6 text-gold"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
          <path d="M12 11h4" />
          <path d="M12 16h4" />
          <path d="M8 11h.01" />
          <path d="M8 16h.01" />
        </svg>
      </div>

      <p className="text-ink-secondary text-[14px] font-medium">
        {MESSAGES[index]}
      </p>
      <p className="text-ink-muted text-xs mt-2">预计需要 10–20 秒</p>
    </div>
  );
}
