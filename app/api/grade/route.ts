import { NextRequest, NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/deepseek";
import {
  SYSTEM_PROMPT,
  SCORING_PROMPT,
  GRAMMAR_PROMPT,
  buildScoringMessage,
  buildGrammarMessage,
} from "@/lib/prompts";
import type { GradeResult } from "@/lib/types";

function extractJson(content: string): string {
  let text = content.trim();
  if (text.startsWith("```json")) text = text.slice(7);
  else if (text.startsWith("```")) text = text.slice(3);
  if (text.endsWith("```")) text = text.slice(0, -3);
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { essay, topic } = await request.json();

    if (!essay || typeof essay !== "string" || essay.trim().length < 30) {
      return NextResponse.json(
        { error: "作文内容至少需要 30 个字符" },
        { status: 400 }
      );
    }

    // 并行调用：评分 + 语法纠错
    const scoringMsg = buildScoringMessage(essay.trim(), topic);
    const grammarMsg = buildGrammarMessage(essay.trim());

    const [scoringRaw, grammarRaw] = await Promise.all([
      callDeepSeek(SCORING_PROMPT, scoringMsg, 0.5),
      callDeepSeek(GRAMMAR_PROMPT, grammarMsg, 0.5),
    ]);

    // 解析评分结果
    const scoringData = JSON.parse(extractJson(scoringRaw));

    // 解析语法结果
    const grammarData = JSON.parse(extractJson(grammarRaw));

    // 组装结果
    const result: GradeResult = {
      score: scoringData.score ?? 8,
      band: scoringData.band ?? "8分档",
      distance_to_next_band:
        scoringData.distance_to_next_band ?? "继续提升语法和词汇水平",
      overall_comment:
        scoringData.overall_comment ??
        "文章已批改完成，请查看详细分析。",
      dimension_scores: {
        relevance: scoringData.dimension_scores?.relevance ?? 12,
        content: scoringData.dimension_scores?.content ?? 12,
        structure: scoringData.dimension_scores?.structure ?? 12,
        grammar: scoringData.dimension_scores?.grammar ?? 12,
        vocabulary: scoringData.dimension_scores?.vocabulary ?? 12,
      },
      grammar_errors: grammarData.grammar_errors ?? [],
      advanced_expressions: grammarData.advanced_expressions ?? [],
      structure_feedback: scoringData.structure_feedback ?? {
        opening: "开头分析暂无",
        body: "主体分析暂无",
        conclusion: "结尾分析暂无",
        coherence: "连贯性分析暂无",
      },
      // 升档版本延迟生成，初始为空
      improved_version_11: "",
      improved_version_14: "",
    };

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("Grading failed:", e);
    return NextResponse.json(
      { error: e.message || "批改服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}
