from collections import defaultdict
from datetime import date

class RateLimiter:
    """IP 访问限制器"""
    
    def __init__(self, daily_limit=1):
        self.daily_limit = daily_limit
        self.usage = defaultdict(lambda: {"date": None, "count": 0})
    
    def check_and_increment(self, ip):
        """
        检查并增加计数
        返回: (allowed, message)
        """
        today = date.today()
        
        # 检查今日是否已使用
        if self.usage[ip]["date"] == today:
            if self.usage[ip]["count"] >= self.daily_limit:
                return False, f"今日免费额度已用完（每天{self.daily_limit}篇），明天再来吧"
        else:
            self.usage[ip]["date"] = today
            self.usage[ip]["count"] = 0
        
        # 增加计数
        self.usage[ip]["count"] += 1
        return True, "成功"
    
    def get_remaining(self, ip):
        """获取剩余次数"""
        today = date.today()
        if self.usage[ip]["date"] == today:
            return max(0, self.daily_limit - self.usage[ip]["count"])
        return self.daily_limit

# 创建全局实例（每天1篇）
limiter = RateLimiter(daily_limit=1)