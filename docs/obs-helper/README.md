# AcFun 官方 OBS 弹幕插件（云表情版）使用指南

支持在 OBS 中显示 AcFun 官方弹幕的「云表情」。本文提供面向新手的快速上手步骤与注意事项。

### 适用环境

- **系统**: Windows
- **软件**: OBS Studio 29 及以上版本（使用「浏览器源」）

## 步骤 1：配置 OBS 启动参数（必做）

为使 OBS 内置浏览器允许加载云表情资源，需要以以下参数启动 OBS：

```
--disable-web-security --disable-site-isolation-trials --user-data-dir=%TEMP%\chrome_cors
```

操作建议（通过快捷方式设置）：

1. 关闭 OBS。
2. 右键桌面的 OBS 快捷方式 → 属性。
3. 在「目标」末尾追加上面的参数，示例如下：

```
"C:\Program Files\obs-studio\bin\64bit\obs64.exe" --disable-web-security --disable-site-isolation-trials --user-data-dir=%TEMP%\chrome_cors
```

参数含义（均为必需）：

- `--disable-web-security`：临时关闭同源策略，允许跨域请求。
- `--disable-site-isolation-trials`：关闭站点隔离实验，避免跨域拦截。
- `--user-data-dir=%TEMP%\chrome_cors`：为 OBS 内置浏览器使用独立的临时用户数据目录，避免影响你日常浏览器。

> ⚠️ 安全提示：以上参数仅应用于 OBS 的「浏览器源」场景，请勿用来启动你日常使用的浏览器。

## 步骤 2：获取 AcFun 官方弹幕页面 URL

打开[AcFun 直播设置页面](https://live.acfun.cn/settings/)，复制系统给出的弹幕页面 URL，形如：

```url
https://live.acfun.cn/room/123456?theme=default&showAuthorclubOnly=false&showAvatar=false
```

## 步骤 3：在 OBS 添加浏览器源并加载页面

1. 打开 OBS（需用步骤 1 设置过参数的方式启动）。
2. 在场景中添加「浏览器源」。
3. 在 URL 栏填入以下地址：

- `https://miegolive.github.io/AcfunCloudEmoji/obs-helper/`

4. 点击「确定」后，页面加载完成。按照页面提示进行交互，在页面中粘贴你在「步骤 2」获取的 AcFun 官方弹幕 URL，即可开始显示带云表情的弹幕。

## 常见问题（FAQ）

- **页面空白或跨域报错**：请确认是通过带有启动参数的快捷方式打开的 OBS，并完全退出后重新启动（包含后台进程）。
- **参数影响日常浏览器吗？** 不会。`--user-data-dir` 指定了独立目录，仅影响 OBS 内置浏览器。
- **确认后不加载官方弹幕**：可能随机生成的 `_did` 与真实用户冲突，请刷新重试。

# TODO LIST

- [ ] 添加 URL 参数功能，免去输入与确认步骤
