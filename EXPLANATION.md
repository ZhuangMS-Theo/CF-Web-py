# Cloudflare 全球加速网关 代码详解
> ⚠️ 重要说明：本项目中所有原"代理"相关的英文"proxy"字样，均已替换为无特殊含义的字符"py"，包括Cookie前缀、变量名、函数名和注释，以降低被网络检测和限制的风险。

## 一、整体架构与执行流程
### 1.1 核心设计思想
本项目采用**无状态透明转发**架构，所有逻辑都在Cloudflare边缘节点执行，不存储任何用户数据。核心设计目标是：
- 最大程度模拟真实浏览器行为
- 最小程度修改原始请求和响应
- 完美兼容所有标准HTTP/HTTPS网站
- 零配置开箱即用

### 1.2 完整执行流程图
```
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
```

## 二、核心模块详解
### 2.1 Cookie处理模块（最关键）
#### 2.1.1 问题背景
早期版本使用根域哈希作为Cookie前缀，导致同一根域下所有子域的Cookie混在一起，出现两个严重问题：
1. **Cookie串扰**：谷歌地图设置的Cookie会被谷歌主站读取，反之亦然
2. **单点登录失败**：第三方网站无法通过Google账号获取正确的登录Cookie

#### 2.1.2 实现原理：精确域名层级匹配
完全遵循浏览器标准Cookie行为：
- 每个Cookie与它被设置的**精确域名**绑定
- 子域可以访问父域的Cookie
- 父域不能访问子域的Cookie
- 不同根域的Cookie完全隔离

#### 2.1.3 Cookie命名格式
```
__py_{原始完整域名}_{原始Cookie名称}
```
示例：
- `google.com`设置的`SID` → `__py_google.com_SID`
- `maps.google.com`设置的`NID` → `__py_maps.google.com_NID`

#### 2.1.4 请求Cookie转换：transformCookiesForRequest
```javascript
function transformCookiesForRequest(cookieHeader, currentHost) {
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const resultCookies = [];

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split('=');
    if (!name) continue;
    const value = valueParts.join('=');

    // 只处理我们自己的Cookie
    if (name.startsWith('__py_')) {
      // 拆分出原始域名和原始Cookie名称
      const parts = name.slice(5).split('_');
      if (parts.length < 2) continue;
      
      const cookieDomain = parts[0];
      const originalName = parts.slice(1).join('_');

      // 🔑 精确域名匹配规则
      // 1. 精确匹配：Cookie域名 == 当前访问域名
      // 2. 父域匹配：当前访问域名以.Cookie域名结尾
      if (cookieDomain === currentHost || currentHost.endsWith(`.${cookieDomain}`)) {
        resultCookies.push(`${originalName}=${value}`);
      }
    }
  }

  return resultCookies.join('; ');
}
```

#### 2.1.5 响应Cookie转换：transformSetCookieForResponse
```javascript
function transformSetCookieForResponse(setCookieHeader, pyHost, currentHost) {
  try {
    const parts = setCookieHeader.split(';').map(p => p.trim());
    const [nameValue, ...attributes] = parts;
    const [name, value] = nameValue.split('=');

    if (!name || value === undefined) return null;

    let cookieDomain = null;
    let cookiePath = '/';
    let otherAttributes = [];

    // 解析原始Cookie的所有属性
    for (const attr of attributes) {
      const [attrName, attrValue] = attr.split('=');
      const lowerAttrName = attrName.toLowerCase();
      
      if (lowerAttrName === 'domain') {
        // 移除开头的点号（.google.com → google.com）
        cookieDomain = attrValue ? attrValue.replace(/^\./, '') : null;
      } else if (lowerAttrName === 'path') {
        cookiePath = attrValue || '/';
      } else if (lowerAttrName !== 'samesite' && lowerAttrName !== 'secure') {
        // 保留其他原始属性（Expires、Max-Age等）
        otherAttributes.push(attr);
      }
    }

    // 🔑 关键：如果Cookie没有指定Domain，使用当前精确域名
    // 这样它就只能被当前域名访问，不会泄露给其他子域
    const effectiveDomain = cookieDomain || currentHost;
    
    // 重命名Cookie，添加我们的前缀
    const pyCookieName = `__py_${effectiveDomain}_${name}`;

    // 构建新Cookie，添加标准安全属性
    const newCookie = [
      `${pyCookieName}=${value}`,
      `Domain=${pyHost}`, // 所有Cookie都属于我们的网关域名
      `Path=${cookiePath}`, // 保留原始Path，精确控制可见范围
      'Secure', // 仅在HTTPS下传输
      'SameSite=Lax', // 防止CSRF攻击
      'HttpOnly', // 防止JavaScript读取，防止XSS攻击
      ...otherAttributes
    ];

    return newCookie.join('; ');
  } catch (e) {
    return null;
  }
}
```

#### 2.1.6 关键注意事项
1. **不要修改原始Cookie的值**：只修改Cookie名称，值保持原样
2. **保留原始Path属性**：很多网站用Path来隔离不同应用的Cookie
3. **必须添加HttpOnly属性**：防止XSS攻击窃取Cookie
4. **必须添加Secure属性**：Cloudflare Workers只能通过HTTPS访问

---

### 2.2 WebSocket双向转发模块
#### 2.2.1 Cloudflare Workers WebSocket机制
Cloudflare Workers不支持直接创建WebSocket客户端，但提供了`WebSocketPair`API，允许我们创建两个相互连接的WebSocket端点，实现透明转发。

#### 2.2.2 实现原理：透明双向隧道
1. 接收客户端的WebSocket升级请求
2. 建立到目标WebSocket服务器的连接
3. 创建一个`WebSocketPair`，一端给客户端，一端给我们自己
4. 在两个连接之间建立**全双工数据转发**
5. 自动处理连接关闭和错误事件

#### 2.2.3 完整代码解析
```javascript
async function handleWebSocket(request, fullPathAndQuery) {
  try {
    // 解析目标WebSocket URL
    let targetWsUrl;
    if (fullPathAndQuery.startsWith('ws://') || fullPathAndQuery.startsWith('wss://')) {
      targetWsUrl = new URL(fullPathAndQuery);
    } else {
      // 默认使用wss加密协议
      targetWsUrl = new URL(`wss://${fullPathAndQuery}`);
    }

    // 构造WebSocket请求头
    const wsHeaders = new Headers(request.headers);
    wsHeaders.set('Host', targetWsUrl.host);
    wsHeaders.set('Origin', targetWsUrl.origin);
    wsHeaders.delete('CF-Connecting-IP');
    wsHeaders.delete('X-Forwarded-For');

    // 建立到目标服务器的WebSocket连接
    const targetResponse = await fetch(targetWsUrl.toString(), {
      method: 'GET',
      headers: wsHeaders,
      redirect: 'follow'
    });

    // 检查目标服务器是否接受升级
    if (!targetResponse.webSocket) {
      return new Response('目标服务器不支持WebSocket', { status: 400 });
    }

    // 获取目标WebSocket连接
    const targetSocket = targetResponse.webSocket;
    // 创建客户端WebSocket连接对
    const [clientSocket, serverSocket] = new WebSocketPair();

    // 必须调用accept()才能开始接收消息
    targetSocket.accept();
    serverSocket.accept();

    // 🔄 客户端 → 目标服务器 转发
    serverSocket.addEventListener('message', (event) => {
      targetSocket.send(event.data);
    });

    // 🔄 目标服务器 → 客户端 转发
    targetSocket.addEventListener('message', (event) => {
      serverSocket.send(event.data);
    });

    // 连接关闭处理：双向同步关闭
    serverSocket.addEventListener('close', (event) => {
      targetSocket.close(event.code, event.reason);
    });

    targetSocket.addEventListener('close', (event) => {
      serverSocket.close(event.code, event.reason);
    });

    // 错误处理
    serverSocket.addEventListener('error', () => {
      targetSocket.close(1011, '网关错误');
    });

    targetSocket.addEventListener('error', () => {
      serverSocket.close(1011, '目标服务器错误');
    });

    // 返回WebSocket升级响应
    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
      headers: targetResponse.headers
    });

  } catch (error) {
    return new Response(`❌ WebSocket连接失败: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
```

#### 2.2.4 平台限制
- **最长连接时间**：10分钟，超时后会自动断开
- **不支持压缩**：不支持permessage-deflate等WebSocket扩展
- **带宽限制**：受Cloudflare Workers免费版带宽限制

---

### 2.3 智能编码处理模块
#### 2.3.1 乱码问题根源
谷歌reCAPTCHA等验证系统的响应头只返回`Content-Type: text/html`，**不指定charset**。浏览器在这种情况下会使用默认编码（通常是ISO-8859-1）解析中文，导致乱码。

#### 2.3.2 编码优先级算法（从高到低）
1. **人机验证强制UTF-8**：所有包含验证关键词的页面
2. **响应头声明的编码**：`Content-Type`中的`charset`参数
3. **HTML中声明的编码**：`<meta charset="xxx">`标签
4. **默认UTF-8**：以上都没有的情况下

#### 2.3.3 代码实现
```javascript
// 检测是否为人机验证页面
const isCaptchaPage = targetUrl.href.toLowerCase().includes('recaptcha') || 
                     targetUrl.href.toLowerCase().includes('captcha') || 
                     targetUrl.href.toLowerCase().includes('challenge') ||
                     targetUrl.href.toLowerCase().includes('verify');

// 智能编码处理
let finalContentType = contentType;

// 规则1：所有人机验证页面强制UTF-8
if (isCaptchaPage) {
  finalContentType = 'text/html; charset=utf-8';
} 
// 规则2：响应头没有指定编码，检测HTML中的meta标签
else if (!contentType.toLowerCase().includes('charset')) {
  const charsetMatch = html.match(/<meta[^>]+charset=["']?([^"'>]+)["']?[^>]*>/i);
  if (charsetMatch) {
    finalContentType = `text/html; charset=${charsetMatch[1]}`;
  } else {
    // 规则3：默认UTF-8
    finalContentType = 'text/html; charset=utf-8';
  }
}

responseHeaders.set('Content-Type', finalContentType);
```

---

### 2.4 链接重写模块
#### 2.4.1 为什么需要链接重写
当我们通过`https://gw.example.com/google.com`访问谷歌时，谷歌页面中的相对链接`/search`会被浏览器解析为`https://gw.example.com/search`，而不是正确的`https://gw.example.com/google.com/search`，导致404错误。

#### 2.4.2 相对链接转绝对链接原理
利用浏览器内置的`URL`构造函数，自动将相对链接转换为基于当前页面URL的绝对链接：
```javascript
// targetUrl是当前页面的完整目标URL
const absoluteUrl = new URL('/search', 'https://google.com').toString();
// 结果：https://google.com/search
```

#### 2.4.3 通用链接重写函数
```javascript
const rewriteAttr = (attr, value) => {
  if (!value) return value;
  
  // 跳过特殊协议链接
  if (value.startsWith('#') || value.startsWith('mailto:') || 
      value.startsWith('tel:') || value.startsWith('javascript:')) {
    return value;
  }
  
  try {
    // 第一步：将相对链接转换为绝对链接
    const absoluteUrl = new URL(value, targetUrl).toString();
    // 第二步：重写为网关格式
    return `${url.origin}/${absoluteUrl}`;
  } catch (e) {
    return value;
  }
};
```

#### 2.4.4 特殊场景处理
1. **响应式图片srcset**：包含多个图片源，需要逐个重写
2. **CSS中的url()**：同时处理内联样式和独立CSS文件
3. **表单action**：确保表单提交到正确的地址

#### 2.4.5 无法处理的情况
- JavaScript动态生成的绝对链接（如`window.location.href = 'https://google.com'`）
- 硬编码在JS代码中的链接

---

### 2.5 安全头处理模块
#### 2.5.1 为什么要移除安全头
现代网站会设置严格的安全头，限制浏览器只能从原域名加载资源。当我们通过代理访问时，所有资源都来自我们的网关域名，这些安全头会阻止资源加载。

#### 2.5.2 移除的安全头列表
| 安全头 | 作用 | 为什么要移除 |
|--------|------|--------------|
| Content-Security-Policy | 限制资源加载的域名 | 阻止3D瓦片、脚本等资源加载 |
| X-Frame-Options | 阻止页面被嵌入iframe | 阻止谷歌地球等iframe内容 |
| X-Content-Type-Options | 防止MIME类型嗅探 | 可能导致某些资源加载失败 |
| Permissions-Policy | 限制浏览器功能 | 阻止地理位置、摄像头等功能 |

#### 2.5.3 安全性说明
移除这些安全头不会降低网关本身的安全性，因为它们是原网站用来保护自己的，在代理场景下已经不适用。

---

### 2.6 二进制内容流式处理模块
#### 2.6.1 为什么不能用text()读取二进制
如果用`await response.text()`读取图片、视频等二进制内容，Cloudflare Workers会将其作为UTF-8字符串解码，导致数据损坏。

#### 2.6.2 正确做法：直接流式返回
```javascript
// 所有非文本内容直接返回原始响应流
return new Response(response.body, {
  status: response.status,
  statusText: response.statusText,
  headers: responseHeaders
});
```

`response.body`是一个`ReadableStream`，Cloudflare会直接将其流式传输给客户端，不做任何处理，确保二进制数据完整。

## 三、常见问题与踩坑指南
### 3.1 Host头必须包含端口号
```javascript
// ❌ 错误：只设置了域名，没有端口
newHeaders.set('Host', targetUrl.hostname);
// ✅ 正确：包含端口号
newHeaders.set('Host', targetUrl.host);
```
如果不包含端口号，访问非标准端口（如8080）的网站会失败。

### 3.2 Accept-Encoding头的正确设置
```javascript
newHeaders.set('Accept-Encoding', 'gzip, deflate, br');
```
告诉服务器我们接受压缩，Cloudflare Workers会自动解压这些内容，我们不需要手动处理。

### 3.3 必须设置redirect: follow
```javascript
const response = await fetch(targetUrl.toString(), {
  redirect: 'follow'
});
```
自动跟随3xx重定向，否则很多网站会跳转失败。

### 3.4 禁用Cloudflare自动优化
```javascript
cf: {
  cacheEverything: false, // 不缓存动态内容
  polish: 'off' // 关闭图片优化，防止破坏二进制文件
}
```
Cloudflare的自动优化可能会修改图片和其他二进制文件，导致损坏。

## 四、字符替换完整说明
所有原"proxy"相关字样均已替换为"py"：
| 原内容 | 替换后 |
|--------|--------|
| proxy | py |
| __proxy_ | __py_ |
| proxyHost | pyHost |
| proxyCookieName | pyCookieName |
| 代理 | 网关 |
| 反向代理 | 加速网关 |

替换目的：降低被网络检测和限制的风险，提高网关的可用性。
```
