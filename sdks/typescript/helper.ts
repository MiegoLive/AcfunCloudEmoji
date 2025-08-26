// helper.ts
const USER_SPACE = 'https://www.acfun.cn/u/';
const ARTICLE_URL = 'https://www.acfun.cn/a/';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
         + 'AppleWebKit/537.36 (KHTML, like Gecko) '
         + 'Chrome/126.0.0.0 Safari/537.36';

/**
 * 根据用户 uid 拉取其直播间表情包，返回规范化 JSON 字符串
 * @param {string} uid
 * @returns {Promise<string>}
 */
export async function getEmotionsJson(uid: string): Promise<string> {
  if (!uid || uid.trim() === '') {
    throw new Error('uid 不能为空');
  }

  // 1. 找文章 id
  const spaceHtml = await (await fetch(`${USER_SPACE}${uid}`, { headers: { 'User-Agent': UA } })).text();
  const m = spaceHtml.match(/<a[^>]*\shref="\/a\/(ac\d+)"[^>]*title=['"][^'"]*直播间表情/);
  if (!m) return buildJson(uid, {});
  const acId = m[1];

  // 2. 拿文章正文
  const articleHtml = await (await fetch(`${ARTICLE_URL}${acId}`, { headers: { 'User-Agent': UA } })).text();

  // 2.1 提取 content
  const contentMatch = articleHtml.match(/"content":\s?"((?:\\.|(?!")[^\\])*)"/);
  if (!contentMatch) return buildJson(uid, {});
  let rawContent = contentMatch[1];
  // 移除 p span 等标签干扰
  const content = rawContent.replace(/<(?!img\b)[^>]+>/g, '');

  // 3. 收集 [name] -> url
  const emotions: Record<string, string> = {};
  const pattern = /\[(.*?)\].*?<img[^>]*\s+src=\\["']([^"']+)\\["']/gs;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const name = match[1];
    const url = match[2].replace(/&amp;/g, '&');
    emotions[`[${name}]`] = url;
  }

  return buildJson(uid, emotions);
}

function buildJson(uid: string, emotions: Record<string, string>): string {
  const now = new Date();
  const root = {
    uid,
    time: now.toISOString(),            // yyyy-MM-ddTHH:mm:ssZ
    timestamp: Math.floor(now.getTime() / 1000),
    emotions
  };
  return JSON.stringify(root, null, 2);
}

/* ===== 使用示例 =====
import { getEmotionsJson } from './helper.ts';
getEmotionsJson('123456')
  .then(console.log)
  .catch(console.error);
*/