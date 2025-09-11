# 更新日志

所有版本变更均遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 规范，  
版本号按 [Semantic Versioning](https://semver.org/lang/zh-CN/) 管理。

---

## [0.1.0] - 2025-09-01
### 新增
- 直播间 UID 自动识别与文章发现逻辑  
- 基于“文章即 CDN”的表情包配置协议  
- 浮层面板：点击“表情”按钮展开 48 px 网格  
- 弹幕关键词到图片的实时替换（MutationObserver 无闪烁）  
- 错误兜底：无文章或格式异常时静默降级  
- 语义化版本号 & Tampermonkey 自更新元数据

### 安全与兼容性
- 仅请求 AcFun 站内接口，无第三方跨域  
- 兼容 Chrome ≥ 88、Edge ≥ 88 及 Tampermonkey ≥ 4.13

---
