using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace AcfunCloudEmoji;

public static class Helper
{
    private static readonly HttpClient Http = new()
    {
        DefaultRequestHeaders =
        {
            { "User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" }
        }
    };
    
    private const string UserSpace = "https://www.acfun.cn/u/";
    private const string ArticleUrl = "https://www.acfun.cn/a/";
    
    /// <summary>
    /// 根据用户 uid 拉取其直播间表情包，返回规范化 JSON。
    /// </summary>
    public static async Task<string> GetEmotionsJsonAsync(string uid)
    {
        if (string.IsNullOrWhiteSpace(uid))
            throw new ArgumentException("uid 不能为空");

        // 1. 找文章 id
        var spaceHtml = await Http.GetStringAsync($"{UserSpace}{uid}");
        var m = Regex.Match(spaceHtml, @"<a[^>]*\shref=""/a/(ac\d+)""[^>]*title=[""'][^""']*直播间表情");
        if (!m.Success) return BuildJson(uid, new JsonObject());
        var acId = m.Groups[1].Value;

        // 2. 拿文章正文
        var articleHtml = await Http.GetStringAsync($"{ArticleUrl}{acId}");

        // 2.1 提取 content
        var contentMatch = Regex.Match(articleHtml, @"""content"":(\s?)""(.*?)(?<!\\)""");
        if (!contentMatch.Success) return BuildJson(uid, new JsonObject());
        var rawContent = contentMatch.Groups[2].Value;
        // 移除 p span 等标签干扰
        var content = Regex.Replace(rawContent, @"<(?!img\b)[^>]+>", "");

        // 3. 找 [name] -> url
        var dict = new JsonObject();
        var pattern = new Regex(@"\[(.*?)\].*?<img[^>]*\s+src=\\[""\']([^""\']+)\\[""\']",
            RegexOptions.Singleline);

        foreach (Match match in pattern.Matches(content))
        {
            var name = match.Groups[1].Value;
            var url  = match.Groups[2].Value.Replace("&amp;", "&");
            dict.TryAdd($"[{name}]",url);
        }
        
        return BuildJson(uid, dict);
    }

    private static string BuildJson(string uid, JsonObject emotions)
    {
        var root = new JsonObject
        {
            ["uid"]  = uid,
            ["time"] = DateTimeOffset.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            ["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            ["emotions"] = emotions
        };
        return root.ToJsonString(new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        });
    }
}