// 作文评分结果
export interface GrammarError {
  original: string;
  error_type: string;
  correction: string;
  explanation: string;
}

export interface AdvancedExpression {
  original: string;
  improved: string;
  explanation: string;
}

export interface StructureFeedback {
  opening: string;
  body: string;
  conclusion: string;
  coherence: string;
}

export interface GradeResult {
  score: number;
  band: string;
  distance_to_next_band: string;
  overall_comment: string;
  dimension_scores: {
    relevance: number;       // 切题度 20%
    content: number;         // 内容完整度 20%
    structure: number;       // 结构连贯性 20%
    grammar: number;         // 语法准确性 20%
    vocabulary: number;      // 词汇与句式高级度 20%
  };
  grammar_errors: GrammarError[];
  advanced_expressions: AdvancedExpression[];
  structure_feedback: StructureFeedback;
  improved_version_11: string;
  improved_version_14: string;
}

export interface HistoryEntry {
  id: string;
  topic: string;
  essay: string;
  result: GradeResult;
  createdAt: string;
}

export interface UpgradeRequest {
  essay: string;
  target_band: "11" | "14";
}

export interface UpgradeResult {
  improved_version: string;
  changes_summary: string;
}

export interface GradeRequest {
  essay: string;
  topic?: string;
}
