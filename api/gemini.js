// api/gemini.js
export default async function handler(req, res) {
    // 1. 配置跨域响应头 (CORS)，允许你的前端安全访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理浏览器的预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // 稳妥地锁在云端服务器后台

    if (!apiKey) {
        return res.status(500).json({ reply: "服务器配置错误：缺少 GEMINI_API_KEY 环境变量。" });
    }

    try {
        // 2. 呼叫 Google Gemini 官方 API (以常用的 gemini-pro 为例)
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await googleResponse.json();

        // 3. 提取文本并转换成你的前端期望的 { reply: "..." } 格式
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiText });
        } else {
            return res.status(200).json({ reply: `API返回异常: ${JSON.stringify(data)}` });
        }

    } catch (error) {
        return res.status(500).json({ reply: `后端转发失败: ${error.message}` });
    }
}
