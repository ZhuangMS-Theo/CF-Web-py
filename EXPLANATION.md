Cloudflare 全球加速网关 代码详解
 
⚠️ 重要说明：本项目中所有原"代理"相关的英文"proxy"字样，均已替换为无特殊含义的字符"py"，包括Cookie前缀、变量名、函数名和注释，以降低被网络检测和限制的风险。
 
一、整体架构与执行流程
 
1.1 核心设计思想
 
本项目采用无状态透明转发架构，所有逻辑都在Cloudflare边缘节点执行，不存储任何用户数据。核心设计目标是：
 
- 最大程度模拟真实浏览器行为
- 最小程度修改原始请求和响应
- 完美兼容所有标准HTTP/HTTPS网站
- 零配置开箱即用
 
1.2 完整执行流程图
 
plaintext  
客户端请求 → 主入口fetch函数
    ↓
┌─ 判断是否为首页？→ 是 → 返回使用说明页面
└─ 否
    ↓
┌─ 判断是否为WebSocket升级请求？→ 是 → 调用handleWebSocket函数
└─ 否
    ↓
智能解析目标URL（支持带/不带协议格式）
    ↓
构造模拟真实浏览器的请求头
    ↓
转换请求Cookie（网关域名 → 目标域名）
    ↓
转发请求到目标服务器
    ↓
处理响应头 → 移除所有限制性安全头
    ↓
转换响应Set-Cookie（目标域名 → 网关域名）
    ↓
根据内容类型分支处理：
├─ HTML → 智能编码处理 + 全面链接重写
├─ CSS → 内部url()重写 + 编码处理
├─ JS/JSON/纯文本 → 编码处理
└─ 其他所有内容 → 直接流式返回
    ↓
返回处理后的响应给客户端
 
 
二、核心模块详解
 
2.1 Cookie处理模块（最关键）
 
2.1.1 问题背景与实现原理
 
早期版本使用根域哈希作为Cookie前缀，导致同一根域下不同子域的Cookie混在一起，出现Cookie串扰和单点登录失败问题。
 
本版本完全遵循浏览器标准Cookie行为：
 
- 每个Cookie与它被设置的精确域名绑定
- 子域可以访问父域的Cookie，父域不能访问子域的Cookie
- 不同根域的Cookie完全隔离
 
2.1.2 Cookie命名格式
 
 __py_{原始完整域名}_{原始Cookie名称} 
 
示例：
 
-  google.com 设置的 SID  →  __py_google.com_SID 
-  maps.google.com 设置的 NID  →  __py_maps.google.com_NID 
 
2.1.3 请求Cookie转换
 
javascript  
function transformCookiesForRequest(cookieHeader, currentHost) {
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const resultCookies = [];

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split('=');
    if (!name) continue;
    const value = valueParts.join('=');

    // 只处理我们自己的Cookie
    if (name.startsWith('__py_')) {
      const parts = name.slice(5).split('_');
      if (parts.length < 2) continue;
      
      const cookieDomain = parts[0];
      const originalName = parts.slice(1).join('_');

      // 精确域名匹配+父域匹配
      if (cookieDomain === currentHost || currentHost.endsWith(`.${cookieDomain}`)) {
        resultCookies.push(`${originalName}=${value}`);
      }
    }
  }

  return resultCookies.join('; ');
}
 
 
2.1.4 响应Cookie转换
 
javascript  
function transformSetCookieForResponse(setCookieHeader, pyHost, currentHost) {
  try {
    const parts = setCookieHeader.split(';').map(p => p.trim());
    const [nameValue, ...attributes] = parts;
    const [name, value] = nameValue.split('=');

    if (!name || value === undefined) return null;

    let cookieDomain = null, cookiePath = '/', otherAttributes = [];
    for (const attr of attributes) {
      const [attrName, attrValue] = attr.split('=');
      const lowerAttrName = attrName.toLowerCase();
      
      if (lowerAttrName === 'domain') {
        cookieDomain = attrValue ? attrValue.replace(/^\./, '') : null;
      } else if (lowerAttrName === 'path') {
        cookiePath = attrValue || '/';
      } else if (lowerAttrName !== 'samesite' && lowerAttrName !== 'secure') {
        otherAttributes.push(attr);
      }
    }

    // 未指定Domain则使用当前精确域名
    const effectiveDomain = cookieDomain || currentHost;
    const pyCookieName = `__py_${effectiveDomain}_${name}`;

    return [
      `${pyCookieName}=${value}`,
      `Domain=${pyHost}`,
      `Path=${cookiePath}`,
      'Secure',
      'SameSite=Lax',
      'HttpOnly',
      ...otherAttributes
    ].join('; ');
  } catch (e) {
    return null;
  }
}
 
 
2.1.5 关键注意事项
 
1. 不修改原始Cookie的值，只修改Cookie名称
2. 完整保留原始Path属性，很多网站用Path隔离不同应用
3. 强制添加HttpOnly和Secure属性，提升安全性
 
 
 
2.2 WebSocket双向转发模块
 
2.2.1 实现原理
 
Cloudflare Workers提供了 WebSocketPair API，允许创建两个相互连接的WebSocket端点，在客户端和目标服务器之间建立透明的全双工数据隧道。
 
2.2.2 完整代码实现
 
javascript  
async function handleWebSocket(request, fullPathAndQuery) {
  try {
    // 解析目标WebSocket URL
    let targetWsUrl = fullPathAndQuery.startsWith('ws://') || fullPathAndQuery.startsWith('wss://')
      ? new URL(fullPathAndQuery)
      : new URL(`wss://${fullPathAndQuery}`);

    const wsHeaders = new Headers(request.headers);
    wsHeaders.set('Host', targetWsUrl.host);
    wsHeaders.set('Origin', targetWsUrl.origin);
    ['CF-Connecting-IP', 'X-Forwarded-For'].forEach(h => wsHeaders.delete(h));

    const targetResponse = await fetch(targetWsUrl.toString(), {
      method: 'GET', headers: wsHeaders, redirect: 'follow'
    });

    if (!targetResponse.webSocket) {
      return new Response('目标服务器不支持WebSocket', { status: 400 });
    }

    const targetSocket = targetResponse.webSocket;
    const [clientSocket, serverSocket] = new WebSocketPair();
    targetSocket.accept();
    serverSocket.accept();

    // 双向数据转发
    serverSocket.addEventListener('message', e => targetSocket.send(e.data));
    targetSocket.addEventListener('message', e => serverSocket.send(e.data));
    // 双向关闭同步
    serverSocket.addEventListener('close', e => targetSocket.close(e.code, e.reason));
    targetSocket.addEventListener('close', e => serverSocket.close(e.code, e.reason));
    // 错误处理
    serverSocket.addEventListener('error', () => targetSocket.close(1011, '网关错误'));
    targetSocket.addEventListener('error', () => serverSocket.close(1011, '目标服务器错误'));

    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
      headers: targetResponse.headers
    })

  } catch (error) {
    return new Response(❌ WebSocket连接失败: ${error.message}, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
 
2.2.3 平台限制
最长连接时间：10分钟，超时后会自动断开
不支持permessage-deflate等WebSocket扩展
 
2.3 智能编码处理模块
2.3.1 乱码问题根源
谷歌reCAPTCHA等验证系统的响应头只返回 Content-Type: text/html ，不指定charset。浏览器会使用默认编码（通常是ISO-8859-1）解析中文，导致乱码。
2.3.2 编码优先级算法（从高到低）
1. 人机验证强制UTF-8
2. 响应头声明的编码
3. HTML中  标签声明的编码
4. 默认UTF-8
2.3.3 代码实现
javascript
// 检测是否为人机验证页面
const isCaptchaPage = /recaptcha|captcha|challenge|verify/i.test(targetUrl.href);
// 智能编码处理
let finalContentType = contentType;
if (isCaptchaPage) {
  finalContentType = 'text/html; charset=utf-8';
} else if (!/charset=/i.test(contentType)) {
  const charsetMatch = html.match(/<meta[^>]+charset=["']?([^"'>]+)["']?[^>]*>/i);
  finalContentType = charsetMatch 
    ? text/html; charset=${charsetMatch[1]} 
    : 'text/html; charset=utf-8';
}
responseHeaders.set('Content-Type', finalContentType);
 
 
2.4 链接重写模块
2.4.1 为什么需要链接重写
当通过 https://gw.example.com/google.com 访问谷歌时，页面中的相对链接 /search 会被浏targetResponse.headers
    })览器解析为 https://gw.example.com/search ，而不是正确的 https://gw.example.com/google.com/search ，导致404错误。
2.4.2 通用链接重写函数
javascript
const rewriteAttr = (attr, value) => {
  if (!value || /^(#|mailto:|tel:|javascript:|data:|blob:)/.test(value) || value.startsWith(url.origin)) {
    return value;
  }
  try {
    // 相对链接转绝对链接
    const absoluteUrl = new URL(value, baseUrl).toString();
    // 重写为网关格式
    return ${url.origin}/${absoluteUrl};
  } catch (e) {
    return value;
  }
};
 
2.4.3 特殊场景处理
响应式图片 srcset ：逐个重写每个图片源
CSS中的 url() 和 @import 语句
表单 action 属性
HTML中所有可能包含链接的属性
 
2.5 安全头与二进制内容处理
2.5.1 安全头移除
移除以下限制性安全头，解决资源加载问题：
 Content-Security-Policy ：阻止3D瓦片、脚本等资源加载
 X-Frame-Options ：阻止谷歌地球等iframe内容
 X-Content-Type-Options ：可能导致某些资源加载失败
 Permissions-Policy ：阻止地理位置、摄像头等功能
所有 Cross-Origin-* 系列安全头
2.5.2 二进制内容流式返回
javascript
// 所有非文本内容直接返回原始响应流
// 避免用text()读取导致二进制数据损坏
return new Response(response.body, {
  status: response.status,
  statusText: response.statusText,
  headers: responseHeaders
});
 
三、常见问题与踩坑指南
1. Host头必须包含端口号：使用 targetUrl.host 而非 targetUrl.hostname ，否则非标准端口访问会失败
2. 必须设置 redirect: follow ：自动跟随3xx重定向，否则很多网站会跳转失败
3. 禁用Cloudflare自动优化： cacheEverything: false 、 polish: 'off' ，防止破坏二进制文件
4. 保留Accept-Encoding头：Cloudflare会自动解压gzip、deflate、br等压缩内容
四、字符替换完整说明
原内容 替换后 
proxy py 
_proxy _py 
proxyHost pyHost 
proxyCookieName pyCookieName 
代理 网关 
反向代理 加速网关 
替换目的：降低被网络检测和限制的风险，提高网关的可用性。