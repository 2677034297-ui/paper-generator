import { NextRequest, NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/deepseek";
import { getUpgradePrompt, buildUpgradeMessage } from "@/lib/prompts";
import type { UpgradeResult } from "@/lib/types";

function extractJson(content: string): string {
  let text = content.trim();
  if (text.startsWith("```json")) text = text.slice(7);
  else if (text.startsWith("```")) text = text.slice(3);
  if (text.endsWith("```")) text = text.slice(0, -3);
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { essay, target_band } = await request.json();

    if (!essay || typeof essay !== "string" || essay.trim().length < 30) {
      return NextResponse.json(
        { error: "作文内容至少需要 30 个字符" },
        { status: 400 }
      );
    }

    if (target_band !== "11" && target_band !== "14") {
      return NextResponse.json(
        { error: "目标档位必须是 11 或 14" },
        { status: 400 }
      );
    }

    const systemPrompt = getUpgradePrompt(target_band);
    const userMessage = buildUpgradeMessage(essay.trim(), target_band);

    const raw = await callDeepSeek(systemPrompt, userMessage, 0.7);

    const data = JSON.parse(extractJson(raw));

    const result: UpgradeResult = {
      improved_version:
        data.improved_version ?? "升级生成失败，请重试",
      changes_summary: data.changes_summary ?? "",
    };

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("Upgrade failed:", e);
    return NextResponse.json(
      { error: e.message || "升级服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}
