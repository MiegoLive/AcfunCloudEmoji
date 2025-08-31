// ==UserScript==
// @name         AcFun云表情
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  AcFun 直播间“云表情”社区企划
// @author       AcfunCloudEmojiCommunity
// @match        https://live.acfun.cn/*
// @grant        GM_xmlhttpRequest
// @updateURL    https://github.com/MiegoLive/AcfunCloudEmoji/raw/main/userscripts/acfuncloudemoji.user.js
// @downloadURL  https://github.com/MiegoLive/AcfunCloudEmoji/raw/main/userscripts/acfuncloudemoji.user.js
// ==/UserScript==

const ARTICLE_URL = 'https://www.acfun.cn/a/';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
         + 'AppleWebKit/537.36 (KHTML, like Gecko) '
         + 'Chrome/126.0.0.0 Safari/537.36';

function httpGet(url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url,
            headers: { 'User-Agent': UA },
            onload: (resp) => resolve(resp.responseText),
            onerror: reject
        });
    });
}

async function getEmotionsJson(uid) {
  if (!uid || uid.trim() === '') {
    throw new Error('uid 不能为空');
  }

  // 1. 找文章 id
  const timestamp = new Date().getTime();
  const reqId = 1;
  const pageSize = 100;
  const articleListUrl = `https://www.acfun.cn/u/${uid}?quickViewId=ac-space-article-list&ajaxpipe=1&type=article&order=newest&page=1&pageSize=${pageSize}&t=${timestamp}&reqId=${reqId}`;
  let articleListJsonString = await httpGet(articleListUrl);
  // 去除末尾的注释 /* ... */
  articleListJsonString = articleListJsonString.replace(/\/\*.*?\*\//g, '');
  const articleListJson = JSON.parse(articleListJsonString);
  const htmlString = articleListJson.html;
  if (!htmlString) return buildJson(uid, {});
  const m = htmlString.match(/<a[^>]*\shref="\/a\/(ac\d+)"[^>]*title=['"][^'"]*直播间表情/);
  if (!m) return buildJson(uid, {});
  const acId = m[1];

  // 2. 拿文章正文
  const articleHtml = await httpGet(`${ARTICLE_URL}${acId}`);

  // 2.1 提取 content
  const contentMatch = articleHtml.match(/"content":\s?"((?:\\.|(?!")[^\\])*)"/);
  if (!contentMatch) return buildJson(uid, {});
  let rawContent = contentMatch[1];
  // 移除 p span 等标签干扰
  const content = rawContent.replace(/<(?!img\b)[^>]+>/g, '');

  // 3. 收集 [name] -> url
  const emotions = {};
  const pattern = /\[(.*?)\].*?<img[^>]*\s+src=\\["']([^"']+)\\["']/gs;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const name = match[1];
    const url = match[2].replace(/&amp;/g, '&');
    emotions[`[${name}]`] = url;
  }

  return buildJson(uid, emotions);
}

function buildJson(uid, emotions) {
  const now = new Date();
  const root = {
    uid,
    time: now.toISOString(),            // yyyy-MM-ddTHH:mm:ssZ
    timestamp: Math.floor(now.getTime() / 1000),
    emotions
  };
  return JSON.stringify(root, null, 2);
}


(async function() {
    'use strict';
    // 0. 获取Uid
    const uid = location.pathname.match(/\/live\/(\d+)/)?.[1] || '';
    if (!uid) return;
    // 1. 获取表情包 json
    const cloudEmojiString = await getEmotionsJson(uid);
    const cloudEmoji = JSON.parse(cloudEmojiString);
    const emotions = cloudEmoji.emotions;
    console.log(emotions);
    if (Object.keys(emotions).length === 0) return;
    // 2. 改造输入框
    const $input = document.querySelector('textarea.danmaku-input');
    const $btn = document.createElement('button');
    const $sendBtn = document.querySelector('.wrap-bottom-area > .send-btn');
    const sendTips = document.querySelector('.send-tips');
    $btn.textContent = '表情';
    $btn.style.marginLeft = '6px';
    sendTips.parentNode.insertBefore($btn, sendTips);
    // 表情面板
    const $panel = document.createElement('div');
    $panel.style.cssText = 'position:absolute; bottom:40px; left:0; z-index:9999; background:#fff; border:1px solid #ccc; padding:6px; display:none;';
    sendTips.parentNode.style.position = 'relative';
    sendTips.parentNode.appendChild($panel);
    // 渲染表情
    Object.entries(emotions).forEach(([kw, url]) => {
        const img = document.createElement('img');
        img.src = url;
        img.title = kw;
        img.style.cssText = 'width:48px;height:48px;margin:2px;cursor:pointer';
        img.onclick = () => sendEmoji(kw);
        $panel.appendChild(img);
    });
    $btn.onclick = () => {$panel.style.display = $panel.style.display==='none' ? 'block' : 'none';}
    function sendEmoji(kw){
        const old = $input.value;
        $input.value = kw;
        $input.dispatchEvent(new Event('input', {bubbles:true}));
        $sendBtn.click();
        requestAnimationFrame(() => { $input.value = old; }); // 恢复原文本
        $panel.style.display = 'none';
    }
    // 3. 改造弹幕显示：把关键词自动替换成图片
    const $screen = document.querySelector('.danmaku-screen'); // 观察区域
    const kwSet = new Set(Object.keys(emotions));
    const mo = new MutationObserver(ms => {
        ms.forEach(m => m.addedNodes.forEach(node=>{
            const txt = node.innerText;
            if(kwSet.has(txt)){
                const img = new Image();
                img.src = emotions[txt];
                img.style.cssText = 'height:1.4em; vertical-align:text-bottom;';
                node.innerHTML = '';
                node.appendChild(img);
            }
        }));
    });
    mo.observe($screen, {childList:true, subtree:true});
})();