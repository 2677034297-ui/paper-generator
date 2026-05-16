"use client";

interface DimensionScores {
  relevance: number;
  content: number;
  structure: number;
  grammar: number;
  vocabulary: number;
}

interface Props {
  score: number;
  band: string;
  distanceToNext: string;
  dimensionScores: DimensionScores;
  overallComment: string;
}

const DIMENSIONS: { key: keyof DimensionScores; label: string }[] = [
  { key: "relevance", label: "切题度" },
  { key: "content", label: "内容完整度" },
  { key: "structure", label: "结构连贯性" },
  { key: "grammar", label: "语法准确性" },
  { key: "vocabulary", label: "词汇句式高级度" },
];

function scoreColor(score: number): string {
  if (score >= 14) return "text-score-green";
  if (score >= 11) return "text-score-amber";
  return "text-score-red";
}

function scoreBg(score: number): string {
  if (score >= 14) return "border-l-score-green";
  if (score >= 11) return "border-l-score-amber";
  return "border-l-score-red";
}

function barColor(val: number): string {
  if (val >= 16) return "bg-score-green";
  if (val >= 12) return "bg-score-amber";
  return "bg-score-red";
}

export default function ScoreCard({
  score,
  band,
  distanceToNext,
  dimensionScores,
  overallComment,
}: Props) {
  const total = Object.values(dimensionScores).reduce((a, b) => a + b, 0);

  return (
    <section className={`card border-l-4 ${scoreBg(score)}`}>
      <div className="p-8">
        {/* 分数区：环形图 + 档位 */}
        <div className="flex items-center gap-8 mb-6">
          {/* 环形分数 */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle
                cx="50" cy="50" r="42"
                fill="none" stroke="#E5E5E5" strokeWidth="6"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className={`${scoreColor(score)} transition-all duration-700`}
                strokeDasharray={`${(score / 14) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-heading font-bold ${scoreColor(score)}`}>
                {score}
              </span>
              <span className="text-xs text-ink-muted">/ 14</span>
            </div>
          </div>

          {/* 档位 + 总评 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-lg font-heading font-semibold ${scoreColor(score)}`}>
                {band}
              </span>
            </div>
            <p className="text-sm text-ink-light leading-relaxed">
              {overallComment}
            </p>
            {score < 14 && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-surface-off rounded-lg px-3 py-1.5">
                <svg className="w-4 h-4 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span className="text-xs text-ink-light">
                  {distanceToNext.length > 50
                    ? distanceToNext.slice(0, 50) + "..."
                    : distanceToNext}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 维度条 */}
        <div className="space-y-3">
          {DIMENSIONS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-ink-muted w-24 flex-shrink-0">
                {label}
              </span>
              <div className="flex-1 h-2 bg-surface-off rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(dimensionScores[key])}`}
                  style={{ width: `${(dimensionScores[key] / 20) * 100}%` }}
                />
              </div>
              <span className="text-xs text-ink-muted w-8 text-right tabular-nums">
                {dimensionScores[key]}/20
              </span>
            </div>
          ))}

          {/* 总分 */}
          <div className="flex items-center gap-3 pt-2 border-t border-surface-border">
            <span className="text-xs font-semibold text-ink w-24 flex-shrink-0">
              总分
            </span>
            <div className="flex-1 h-2 bg-surface-off rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-ink transition-all duration-500"
                style={{ width: `${total}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-ink w-8 text-right tabular-nums">
              {total}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
