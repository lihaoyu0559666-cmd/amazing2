#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
中国农业大学“耘思”大思政平台 - 数据更新脚本

用途：
用于从公开权威媒体和学校官网抓取最新思政教育、强农兴农相关新闻，
更新项目的 data/news.json 数据文件。

使用方法：
1. 确保已安装必要依赖：pip install requests beautifulsoup4 feedparser
2. 在项目根目录下运行此脚本：python scripts/fetch_news.py
3. 脚本会自动拉取解析，并更新 data/news.json 文件。

注意事项：
1. 仅抓取标题、来源、发布时间、原文链接和简短摘要，不抓取正文和图片。
2. 设置了随机延迟以避免对目标服务器造成压力。
3. 对于反爬严格或无法稳定访问的网站，采用后备（Fallback）人工链接清单。
"""

import os
import json
import time
import random
import requests
from bs4 import BeautifulSoup
import feedparser
from datetime import datetime

# 全局配置
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'news.json')

# 示例后备（Fallback）数据：当网络请求失败或被拦截时使用
FALLBACK_DATA = [
    {
        "title": "农业农村部部署抓好当前农业生产工作",
        "category": "要闻",
        "source": "新华网",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "summary": "要求各地切实抓好春季农业生产，夯实全年粮食和农业丰收基础。",
        "url": "http://www.news.cn/politics/",
        "image": "images/focus-placeholder.jpg",
        "isTop": False,
        "isRecommend": False,
        "tags": ["农业生产", "时政要闻"]
    }
]

def load_existing_data():
    """读取已有的 news.json"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"读取现有数据失败: {e}")
    return []

def save_data(data):
    """保存数据到 news.json"""
    # 确保目录存在
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"数据已成功保存至 {DATA_FILE}，共 {len(data)} 条。")
    except Exception as e:
        print(f"保存数据失败: {e}")

def fetch_rss_feed(url, category, source):
    """解析 RSS 订阅源提取简要信息"""
    print(f"正在拉取 RSS 源: {source}...")
    results = []
    try:
        feed = feedparser.parse(url)
        for entry in feed.entries[:5]: # 取前5条
            # 尝试提取时间
            pub_date = entry.get('published', '')
            if pub_date:
                # 简单格式化时间为 YYYY-MM-DD
                try:
                    dt = datetime.strptime(pub_date[0:16], "%a, %d %b %Y")
                    pub_date = dt.strftime("%Y-%m-%d")
                except:
                    pub_date = datetime.now().strftime("%Y-%m-%d")
            else:
                pub_date = datetime.now().strftime("%Y-%m-%d")
                
            summary = entry.get('summary', '')
            # 清理 HTML 标签
            soup = BeautifulSoup(summary, 'html.parser')
            clean_summary = soup.get_text()[:80] + '...' if len(soup.get_text()) > 80 else soup.get_text()

            results.append({
                "title": entry.get('title', ''),
                "category": category,
                "source": source,
                "date": pub_date,
                "summary": clean_summary,
                "url": entry.get('link', ''),
                "image": "images/study-placeholder.jpg",
                "isTop": False,
                "isRecommend": False,
                "tags": [category]
            })
        time.sleep(random.uniform(1, 3)) # 随机延迟
    except Exception as e:
        print(f"拉取 {source} 失败: {e}")
    return results

def main():
    print("开始执行内容更新脚本...")
    existing_data = load_existing_data()
    new_data = []
    
    # 示例：通过 RSS 获取人民网理论频道（此处以公开测试源代替实际源）
    # 注：实际环境中许多新闻网站不再提供标准 RSS，此时需使用 html 解析
    people_theory_url = "http://www.people.com.cn/rss/theory.xml" 
    
    new_data.extend(fetch_rss_feed(people_theory_url, "学习", "人民网"))
    
    # 如果抓取失败，使用 fallback
    if not new_data:
        print("未抓取到有效数据，使用 Fallback 数据补充...")
        new_data.extend(FALLBACK_DATA)
        
    # 合并数据（简单去重和生成 ID）
    combined_data = new_data + existing_data
    
    # 生成唯一 ID，并保留最新30条
    final_data = []
    seen_titles = set()
    current_id = 1
    
    for item in combined_data:
        if item['title'] not in seen_titles:
            item['id'] = current_id
            seen_titles.add(item['title'])
            final_data.append(item)
            current_id += 1
            if current_id > 30:
                break
                
    save_data(final_data)
    print("内容更新脚本执行完毕！")

if __name__ == "__main__":
    main()
