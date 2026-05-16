import os
import re
import time
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
from utils.rate_limit import limiter
# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="static")
CORS(app)

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)

# =========================================================
# 优化的降 AI 率提示词（更自然、更接近人类写作）
# =========================================================

GENERATE_PROMPT = """
你是一位经验丰富的中文学术论文写作导师，擅长帮助学生写出自然、流畅、有深度的学术论文。

## 核心任务
根据用户提供的论文题目，生成一篇**读起来像真实学生/研究者所写**的中文学术论文。

## 论文结构（必须完整）
1. 标题
2. 摘要（3段，每段150-200字）
3. 关键词（3-5个）
4. 引言（4段，每段150-200字）
5. 正文（3节，每节2-3段，每段150-200字）
6. 结论（3段，每段150-200字）

## 写作风格要求（非常重要）

### 要做的 ✅
1. **自然表达**：像正常人类写作一样，有适当的转折和过渡
2. **适度冗余**：不是每句话都要最简，允许适当的解释性重复
3. **灵活句式**：长短句结合，不要全是结构工整的排比句
4. **真实感**：偶尔使用"可以看出"、"值得注意的是"、"需要说明的是"等过渡语
5. **逻辑连贯**：段落之间有自然的承接关系

### 不要做的 ❌
1. 不要使用"首先、其次、再次、最后"这种机械的枚举结构
2. 不要每个段落都以同样的句式开头
3. 不要使用"总之"、"综上所述"过于频繁（每部分最多一次）
4. 不要使用"xxx呢"、"至于xxx呢"这种口语化表达
5. 不要使用第一人称（我、我们、笔者）
6. 不要过度使用"此外"、"另外"、"同时"（每部分限2次）

## 具体语言规则

### 动词表达（用自然的，不用最简的）
- 使用/采用 → 运用 / 选用
- 通过 → 借助 / 依靠
- 实现 → 得以实现
- 管理 → 开展管理
- 交互 → 进行交互
- 配置 → 进行配置

### 增加自然辅助词（适当使用）
可以适当增加：了、的、会、可以、这个、方面、当中、便、则

### 连接词（更自然）
- 和/与 → 以及
- 并 → 并且 / 同时

### 句式
- 适当使用"把"字句
- 用"如果...就..."替代生硬的"若...则..."
- 长短句交替，不要全是短句

### 括号内容处理
遇到括号（比如"术语（解释）"），应该融入句子：
- 术语也就是解释
- 或者直接写：解释（即术语）

### 技术术语
技术名词、API名称、框架名、文件路径必须保持原样，不能改。

## 输出要求
直接输出论文正文，不要有任何额外的说明、解释或提示。
"""

# =========================================================
# 可选：二次润色（进一步降低 AI 痕迹）
# =========================================================

POLISH_PROMPT = """
你是一位专业的论文润色编辑。请对以下论文进行优化，使其读起来更像人类写作，同时保持原有内容和结构。

优化原则：
1. 不要改变技术事实和专业术语
2. 调整过于工整的句式，让长短句交替
3. 适当增加自然的过渡语
4. 减少机械的"首先、其次、再次"结构
5. 保持学术正式性，不要口语化

请直接输出优化后的论文，不要输出解释。
"""

# =========================================================
# 智能论文解析器（增强版）
# =========================================================

class PaperParser:
    """论文解析器，将纯文本解析为结构化数据"""
    
    def __init__(self):
        self.result = None
        self.current_section = None
        self.current_subtitle = None
        self.current_paragraph = []
    
    def parse(self, content, title):
        """解析论文内容"""
        self.result = {
            "title": title,
            "abstract": [],
            "keywords": [],
            "introduction": [],
            "body": [],
            "conclusion": [],
            "full_text": content
        }
        self.current_section = None
        self.current_subtitle = None
        self.current_paragraph = []
        
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                self._save_paragraph()
                continue
            self._process_line(line)
        
        self._save_paragraph()
        return self.result
    
    def _save_paragraph(self):
        """保存当前段落"""
        if not self.current_paragraph:
            return
        
        paragraph = ' '.join(self.current_paragraph).strip()
        if not paragraph:
            self.current_paragraph = []
            return
        
        if self.current_section == 'abstract':
            self.result['abstract'].append(paragraph)
        elif self.current_section == 'introduction':
            self.result['introduction'].append(paragraph)
        elif self.current_section == 'conclusion':
            self.result['conclusion'].append(paragraph)
        elif self.current_section == 'body':
            subtitle = self.current_subtitle or '正文'
            # 查找或创建 body 节
            existing = next(
                (b for b in self.result['body'] if b['subtitle'] == subtitle),
                None
            )
            if existing:
                existing['paragraphs'].append(paragraph)
            else:
                self.result['body'].append({
                    'subtitle': subtitle,
                    'paragraphs': [paragraph]
                })
        
        self.current_paragraph = []
    
    def _process_line(self, line):
        """处理单行文本"""
        lower_line = line.lower()
        
        # 识别章节标题
        section_map = [
            (r'^(摘要|abstract)', 'abstract'),
            (r'^(关键词|关键字|keywords?)', 'keywords'),
            (r'^(引言|绪论|introduction)', 'introduction'),
            (r'^(结论|结语|conclusion)', 'conclusion'),
        ]
        
        for pattern, section in section_map:
            if re.match(pattern, lower_line):
                self._save_paragraph()
                self.current_section = section
                self.current_subtitle = None
                
                # 关键词特殊处理
                if section == 'keywords':
                    self._extract_keywords(line)
                return
        
        # 识别正文小标题
        is_subtitle = (
            len(line) < 40 and (
                re.match(r'^[一二三四五六七八九十]+[、.]', line) or
                re.match(r'^\d+[、.]', line) or
                line.endswith('章') or
                line.endswith('节')
            )
        )
        
        if is_subtitle:
            self._save_paragraph()
            self.current_section = 'body'
            self.current_subtitle = line
            return
        
        # 普通段落内容
        self.current_paragraph.append(line)
    
    def _extract_keywords(self, line):
        """提取关键词"""
        kw_line = re.sub(r'^(关键词|关键字|keywords?)[:：]?', '', line, flags=re.I).strip()
        for sep in ['，', '、', ',', ';', '；']:
            if sep in kw_line:
                self.result['keywords'] = [k.strip() for k in kw_line.split(sep) if k.strip()]
                break
        else:
            if kw_line:
                self.result['keywords'] = [kw_line]

# 创建解析器实例
parser = PaperParser()

# =========================================================
# 可选：二次润色开关
# =========================================================
ENABLE_POLISH = False  # 设为 True 开启二次润色（会消耗更多 token）

# =========================================================
# API 路由
# =========================================================

@app.route("/api/generate", methods=["POST"])
def generate():
    """生成论文 API"""
    
    # ========== IP 限制（每天1篇）==========
    user_ip = request.remote_addr
    allowed, message = limiter.check_and_increment(user_ip)
    if not allowed:
        return jsonify({"error": message}), 429
    # ====================================
    
    data = request.get_json(silent=True)
    
    if not data or "title" not in data:
        return jsonify({"error": "请提供论文题目"}), 400
    
    title = data["title"].strip()
    if not title:
        return jsonify({"error": "论文题目不能为空"}), 400
    
    # 可选参数
    enable_polish = data.get("polish", ENABLE_POLISH)  # 是否二次润色
    
    try:
        start_time = time.time()
        logger.info(f"开始生成论文：{title}")
        
        # 第一步：生成论文
        response = client.chat.completions.create(
            model="deepseek-v4-pro",
            messages=[
                {"role": "system", "content": GENERATE_PROMPT},
                {"role": "user", "content": f"论文题目：{title}"}
            ],
            temperature=0.7,
            top_p=0.92,
            max_tokens=8192,
        )
        
        paper_content = response.choices[0].message.content
        logger.info(f"论文生成完成，耗时：{time.time() - start_time:.2f}秒")
        
        # 第二步：可选二次润色
        if enable_polish:
            logger.info("开始二次润色...")
            polish_response = client.chat.completions.create(
                model="deepseek-v4-pro",
                messages=[
                    {"role": "system", "content": POLISH_PROMPT},
                    {"role": "user", "content": paper_content}
                ],
                temperature=0.65,
                top_p=0.9,
                max_tokens=8192,
            )
            paper_content = polish_response.choices[0].message.content
            logger.info("二次润色完成")
        
        # 解析论文
        result = parser.parse(paper_content, title)
        
        logger.info(f"论文解析完成，摘要：{len(result['abstract'])}段，正文：{len(result['body'])}节")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"生成失败：{str(e)}")
        return jsonify({"error": f"生成失败：{str(e)}"}), 500