import os
import re
import time
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static")
CORS(app)

logger = logging.getLogger(__name__)

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)

# =========================================================
# 作文批改提示词
# =========================================================

CORRECT_PROMPT = """你是一位专业的英语作文批改老师，擅长四六级作文批改。

请对用户提交的作文进行批改，按以下JSON格式输出：
{
  "score": 85,
  "level": "良好",
  "summary": "整体评价（50字左右）",
  "grammar_errors": [
    {"original": "原句", "correction": "修改后", "explanation": "错误说明"}
  ],
  "word_suggestions": [
    {"original": "原词", "suggestion": "建议词", "reason": "原因"}
  ],
  "structure_advice": "结构建议（80字左右）",
  "full_correction": "完整批改后的作文全文"
}

评分标准：
- 90-100：优秀，表达地道
- 75-89：良好，有小问题
- 60-74：及格，有较多问题
- 60以下：需大幅改进

要求：
1. 严格按JSON格式输出
2. 语言温和、鼓励性
3. 给出的建议要具体可操作
4. 不要输出任何其他内容
"""

@app.route("/")
def index():
    return send_from_directory("static", "index.html")

@app.route("/api/correct", methods=["POST"])
def correct_essay():
    data = request.get_json(silent=True)
    if not data or "essay" not in data:
        return jsonify({"error": "请提供作文内容"}), 400

    essay = data["essay"].strip()
    if not essay:
        return jsonify({"error": "作文内容不能为空"}), 400

    try:
        logger.info(f"开始批改作文，长度：{len(essay)}字")

        response = client.chat.completions.create(
            model="deepseek-v4-pro",
            messages=[
                {"role": "system", "content": CORRECT_PROMPT},
                {"role": "user", "content": f"请批改以下作文：\n\n{essay}"}
            ],
            temperature=0.5,
            max_tokens=4000,
        )

        content = response.choices[0].message.content
        # 清理可能不是纯JSON的内容
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        import json
        result = json.loads(content.strip())
        logger.info(f"批改完成，得分：{result.get('score', 'N/A')}")
        return jsonify(result)

    except json.JSONDecodeError as e:
        logger.error(f"JSON解析失败：{str(e)}")
        return jsonify({"error": "批改结果解析失败，请重试"}), 500
    except Exception as e:
        logger.error(f"批改失败：{str(e)}")
        return jsonify({"error": f"批改失败：{str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
