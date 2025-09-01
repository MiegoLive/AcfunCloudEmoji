# AcFun 云表情 — 观众端油猴脚本

> 适用于 **AcFun 直播间** 的 Tampermonkey 用户脚本。  
> 通过“文章即 CDN”的极简思路，让主播与观众共享一套云端表情包，无需服务器、零运维。

---

## 1 技术思路

### 1.1 架构概览

| 组件 | 作用 | 实现 |
| --- | --- | --- |
| **数据源** | 统一存放表情包映射 | 主播在 AcFun 发布的 **图文文章** |
| **客户端** | 实时拉取 → 渲染 → 注入弹幕 | 本油猴脚本 |
| **协议** | 约定文章格式，保证可扩展 | 关键词 `[名称]` ↔ 图片 URL |

### 1.2 数据流转

1. **发现文章**  
   脚本在主播 UID 的空间文章列表里正则匹配标题含 **“直播间表情”** 的最新文章，提取 `acId`。

2. **解析正文**  
   利用正则 `\[(.*?)\].*?<img[^>]*\s+src=\\["']([^"']+)\\["']` 生成 `{"[name]": "url"}` 字典。  
   - 容错：若文章不存在或格式异常 → 返回空字典，脚本静默退出。  
   - 缓存：每次进入直播页实时拉取，无本地持久化，保证“云端最新”。

3. **UI 注入**  
   - 输入区：新增 **“表情”** 按钮，点击弹出浮层面板（绝对定位，z-index 9999）。  
   - 发送逻辑：点击表情 → 先填充输入框 → 触发原生发送 → `requestAnimationFrame` 恢复原文本，避免破坏用户草稿。  
   - 弹幕渲染：监听 `.danmaku-screen` 的 `MutationObserver`，若文本完全匹配关键词，则替换为 `<img>`，高度 1.4 em，垂直居中。

4. **跨域与权限**  
   仅用 `GM_xmlhttpRequest` 解决 AcFun 的 CORS；脚本最小权限原则：`@grant GM_xmlhttpRequest` 仅一项。

---

## 2 安装与配置

1. 浏览器安装 [Tampermonkey][tampermonkey]。
2. 点击 [acfuncloudemoji.user.js][release] 一键安装（或复制源码新建脚本）。

---

## 3 已完成功能

- [x] 直播间 UID 自动识别  
- [x] 文章发现 & JSON 解析  
- [x] 表情浮层面板（48 px 网格，响应式关闭）  
- [x] 弹幕关键词 → 图片实时替换  
- [x] 无侵入式注入，兼容原有礼物 / 付费弹幕  
- [x] 错误兜底：无文章 / 格式异常时静默降级  
- [x] 语义化版本号 & 自动更新元数据字段

---

## 4 TODO

- [ ] 优化 UI，更美观的表情按钮
- [ ] 添加网页全屏/桌面全屏模式时的输入框增强
- [ ] (long term)添加表情面板分页，支持跨直播间使用

---

## 5 开发者指南

### 5.1 本地调试

```bash
git clone https://github.com/MiegoLive/AcfunCloudEmoji.git
# 修改 userscripts/acfuncloudemoji.user.js
# Chrome → Tampermonkey 面板 → “+” → 粘贴覆盖 → Ctrl+S
```

### 5.2 构建 / 发布

本项目采用 **无构建** 策略，脚本即源码。发版步骤：

1. 更新 `// @version` 与 CHANGELOG.md
2. Tampermonkey 检测到 `@updateURL` 提示更新。

### 5.3 贡献规范

- 代码格式：Prettier 默认配置  
- Commit message：遵循 Conventional Commits  
- PR 请先开 Issue 讨论，避免重复劳动

---

## 6 许可证

MIT © AcfunCloudEmoji

[tampermonkey]: https://www.tampermonkey.net  
[release]: https://github.com/MiegoLive/AcfunCloudEmoji/raw/main/userscripts/acfuncloudemoji.user.js