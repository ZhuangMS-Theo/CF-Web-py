export default {
  // 主请求处理入口：所有请求都会经过这个函数
  async fetch(request, env, ctx) {
    try {
      // 解析当前请求的完整URL
      const url = new URL(request.url);
      // 提取路径和查询参数（去掉开头的斜杠）
      const fullPathAndQuery = url.pathname.slice(1) + url.search;

      // ==================== 首页：使用说明界面 ====================
      if (!fullPathAndQuery) {
        return new Response(`
          <!DOCTYPE html>
          <html lang="zh-CN">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Cloudflare 全球加速网关（CF-Web-py）</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
                }
                
                .container {
                  background: white;
                  border-radius: 16px;
                  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                  max-width: 700px;
                  width: 100%;
                  padding: 40px;
                }
                
                .header {
                  text-align: center;
                  margin-bottom: 35px;
                }
                
                .header h1 {
                  color: #1a202c;
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: 10px;
                }
                
                .header p {
                  color: #718096;
                  font-size: 16px;
                }
                
                .features {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                  gap: 15px;
                  margin-bottom: 35px;
                }
                
                .feature-item {
                  background: #f7fafc;
                  padding: 15px 20px;
                  border-radius: 10px;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  transition: all 0.2s ease;
                }
                
                .feature-item:hover {
                  background: #f0f4ff;
                  transform: translateY(-2px);
                }
                
                .feature-icon {
                  font-size: 20px;
                  color: #667eea;
                  min-width: 24px;
                  text-align: center;
                }
                
                .feature-text {
                  color: #2d3748;
                  font-weight: 500;
                  font-size: 14px;
                }
                
                .usage-section {
                  background: #f0f4ff;
                  border-radius: 12px;
                  padding: 25px;
                  margin-bottom: 30px;
                }
                
                .usage-title {
                  color: #4a5568;
                  font-size: 18px;
                  font-weight: 600;
                  margin-bottom: 18px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                
                .usage-examples {
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                }
                
                .example-item {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                
                .example-label {
                  color: #718096;
                  min-width: 100px;
                  font-size: 14px;
                }
                
                .example-code {
                  flex: 1;
                  background: white;
                  padding: 8px 12px;
                  border-radius: 6px;
                  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
                  font-size: 13px;
                  color: #2d3748;
                  overflow-x: auto;
                  white-space: nowrap;
                }
                
                .footer {
                  text-align: center;
                  color: #a0aec0;
                  font-size: 13px;
                  line-height: 1.5;
                }
                
                @media (max-width: 640px) {
                  .container {
                    padding: 25px;
                  }
                  
                  .header h1 {
                    font-size: 24px;
                  }
                  
                  .features {
                    grid-template-columns: 1fr;
                  }
                  
                  .example-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 5px;
                  }
                  
                  .example-label {
                    min-width: auto;
                  }
                  
                  .example-code {
                    width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🌐 Cloudflare 全球加速网关</h1>
                  <p>基于 Cloudflare 全球边缘节点的高速通用网关</p>
                </div>
                
                <div class="features">
                  <div class="feature-item">
                    <span class="feature-icon">🔒</span>
                    <span class="feature-text">支持 HTTP/HTTPS 双协议</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🔌</span>
                    <span class="feature-text">支持任意自定义端口</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🍪</span>
                    <span class="feature-text">完美修复Cookie串扰与单点登录</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">✅</span>
                    <span class="feature-text">智能编码处理 所有人机验证无乱码</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🖼️</span>
                    <span class="feature-text">所有资源完美加载（图片/视频/文件）</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🔗</span>
                    <span class="feature-text">无限层级嵌套跳转支持</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🌍</span>
                    <span class="feature-text">完整支持谷歌地球3D全景</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">⚡</span>
                    <span class="feature-text">Cloudflare 全球节点加速</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🔄</span>
                    <span class="feature-text">完整支持WebSocket双向连接</span>
                  </div>
                </div>
                
                <div class="usage-section">
                  <div class="usage-title">
                    <span>📖</span> 使用方法
                  </div>
                  <div class="usage-examples">
                    <div class="example-item">
                      <span class="example-label">默认 HTTPS</span>
                      <code class="example-code">${url.origin}/google.com</code>
                    </div>
                    <div class="example-item">
                      <span class="example-label">谷歌地球</span>
                      <code class="example-code">${url.origin}/earth.google.com/web</code>
                    </div>
                    <div class="example-item">
                      <span class="example-label">指定 HTTP</span>
                      <code class="example-code">${url.origin}/http://example.com</code>
                    </div>
                    <div class="example-item">
                      <span class="example-label">自定义端口</span>
                      <code class="example-code">${url.origin}/localhost:3000</code>
                    </div>
                    <div class="example-item">
                      <span class="example-label">WebSocket</span>
                      <code class="example-code">wss://${url.host}/wss://echo.websocket.org</code>
                    </div>
                  </div>
                </div>
                
                <div class="footer">
                  请仅用于合法合规用途，遵守当地法律法规<br>
                  所有Cookie和登录信息仅存储在您的本地浏览器中<br>
                  Github：https://github.com/ZhuangMS-Theo/CF-Web-py/
                  KKGithub：https://kkgithub.com/ZhuangMS-Theo/CF-Web-py/
                </div>
              </div>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }

      // ==================== 检测并处理WebSocket升级请求 ====================
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
        return handleWebSocket(request, fullPathAndQuery);
      }

      // ==================== 智能解析目标URL ====================
      // 支持两种格式：
      // 1. 带协议：https://你的域名/http://example.com
      // 2. 不带协议：https://你的域名/example.com（默认HTTPS）
      let targetUrl;
      if (fullPathAndQuery.startsWith('http://') || fullPathAndQuery.startsWith('https://')) {
        targetUrl = new URL(fullPathAndQuery);
      } else {
        // 分离域名和后续路径
        const firstSlashIndex = fullPathAndQuery.indexOf('/');
        let targetAuthority, remainingPathAndQuery;
        
        if (firstSlashIndex === -1) {
          targetAuthority = fullPathAndQuery;
          remainingPathAndQuery = '';
        } else {
          targetAuthority = fullPathAndQuery.slice(0, firstSlashIndex);
          remainingPathAndQuery = fullPathAndQuery.slice(firstSlashIndex);
        }
        
        targetUrl = new URL(`https://${targetAuthority}${remainingPathAndQuery}`);
      }

      // ==================== 构造请求头（模拟真实浏览器） ====================
      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', targetUrl.host); // 必须包含端口号，否则非标准端口会失败
      newHeaders.set('Referer', targetUrl.origin);
      newHeaders.set('Origin', targetUrl.origin);
      // 移除可能暴露真实IP的头
      newHeaders.delete('CF-Connecting-IP');
      newHeaders.delete('X-Forwarded-For');
      // 告诉服务器我们接受压缩，Cloudflare会自动解压
      newHeaders.set('Accept-Encoding', 'gzip, deflate, br');

      // ==================== 转换请求Cookie ====================
      // 将我们域名下的Cookie转换为目标域名的Cookie
      const cookieHeader = request.headers.get('Cookie');
      if (cookieHeader) {
        const transformedCookies = transformCookiesForRequest(cookieHeader, targetUrl.hostname);
        if (transformedCookies) {
          newHeaders.set('Cookie', transformedCookies);
        } else {
          newHeaders.delete('Cookie');
        }
      }

      // ==================== 转发请求到目标服务器 ====================
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.body,
        redirect: 'follow', // 自动跟随3xx重定向
        cf: {
          cacheEverything: false, // 不缓存动态内容
          polish: 'off' // 关闭Cloudflare图片优化，防止破坏二进制文件
        }
      });

      // ==================== 处理响应头 ====================
      const responseHeaders = new Headers(response.headers);

      // 移除所有限制性安全头，解决谷歌地球3D和各种加载问题
      // 这些头会限制浏览器只能从原域名加载资源
      responseHeaders.delete('Content-Security-Policy');
      responseHeaders.delete('Content-Security-Policy-Report-Only');
      responseHeaders.delete('X-Frame-Options');
      responseHeaders.delete('X-Content-Type-Options');
      responseHeaders.delete('Permissions-Policy');

      // 添加CORS支持，允许跨域请求带凭据
      responseHeaders.set('Access-Control-Allow-Origin', url.origin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
      responseHeaders.set('Access-Control-Allow-Headers', '*');

      // ==================== 转换响应Set-Cookie头 ====================
      // 将目标域名的Cookie转换为我们域名的Cookie
      const setCookieHeaders = response.headers.getAll('Set-Cookie');
      responseHeaders.delete('Set-Cookie');
      
      for (const setCookie of setCookieHeaders) {
        const transformedCookie = transformSetCookieForResponse(setCookie, url.hostname, targetUrl.hostname);
        if (transformedCookie) {
          responseHeaders.append('Set-Cookie', transformedCookie);
        }
      }

      // ==================== 处理不同类型的响应内容 ====================
      const contentType = response.headers.get('Content-Type') || '';
      // 检测是否为人机验证页面
      const isCaptchaPage = targetUrl.href.toLowerCase().includes('recaptcha') || 
                           targetUrl.href.toLowerCase().includes('captcha') || 
                           targetUrl.href.toLowerCase().includes('challenge') ||
                           targetUrl.href.toLowerCase().includes('verify');

      // -------------------- 处理HTML内容 --------------------
      if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
        let html = await response.text();
        
        // ==================== 智能编码处理逻辑 ====================
        // 优先级：人机验证强制UTF-8 > 响应头声明的编码 > HTML中meta声明的编码 > 默认UTF-8
        let finalContentType = contentType;
        
        // 规则1：所有人机验证页面强制使用UTF-8编码（解决乱码核心）
        if (isCaptchaPage) {
          finalContentType = 'text/html; charset=utf-8';
        } 
        // 规则2：如果响应头没有指定编码，检测HTML中的meta标签
        else if (!contentType.toLowerCase().includes('charset')) {
          // 正则匹配<meta charset="xxx">标签
          const charsetMatch = html.match(/<meta[^>]+charset=["']?([^"'>]+)["']?[^>]*>/i);
          if (charsetMatch) {
            // 使用HTML中声明的编码
            finalContentType = `text/html; charset=${charsetMatch[1]}`;
          } else {
            // 规则3：都没有声明，默认使用UTF-8
            finalContentType = 'text/html; charset=utf-8';
          }
        }
        
        // 设置最终的Content-Type
        responseHeaders.set('Content-Type', finalContentType);

        // ==================== 通用链接重写函数 ====================
        // 将所有链接转换为我们的网关格式
        const rewriteAttr = (attr, value) => {
          if (!value) return value;
          
          // 跳过特殊协议链接（锚点、邮件、电话、JavaScript）
          if (value.startsWith('#') || value.startsWith('mailto:') || 
              value.startsWith('tel:') || value.startsWith('javascript:')) {
            return value;
          }
          
          try {
            // 将相对链接转换为绝对链接（基于当前页面URL）
            const absoluteUrl = new URL(value, targetUrl).toString();
            // 重写为网关格式
            return `${url.origin}/${absoluteUrl}`;
          } catch (e) {
            return value;
          }
        };

        // 重写所有HTML属性中的链接
        html = html.replace(
          /(href|src|action|srcset|data-src|data-href|poster|formaction|background)=["']([^"']*)["']/g,
          (match, attr, value) => {
            // 特殊处理响应式图片srcset（包含多个图片源）
            if (attr === 'srcset') {
              const rewrittenSources = value.split(',').map(source => {
                const parts = source.trim().split(/\s+/);
                if (parts.length === 0) return source;
                const rewrittenUrl = rewriteAttr(attr, parts[0]);
                return `${rewrittenUrl} ${parts.slice(1).join(' ')}`;
              });
              return `${attr}="${rewrittenSources.join(', ')}"`;
            }
            return `${attr}="${rewriteAttr(attr, value)}"`;
          }
        );

        // 重写CSS中的url()（包括内联样式和style标签）
        html = html.replace(
          /url\(["']?([^"')]+)["']?\)/g,
          (match, value) => {
            const rewrittenUrl = rewriteAttr('url', value);
            return `url("${rewrittenUrl}")`;
          }
        );

        return new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
      }

      // -------------------- 处理CSS文件 --------------------
      if (contentType.includes('text/css')) {
        let css = await response.text();
        
        // 重写CSS文件内部的url()
        css = css.replace(
          /url\(["']?([^"')]+)["']?\)/g,
          (match, value) => {
            if (value.startsWith('#') || value.startsWith('data:')) return match;
            
            try {
              const absoluteUrl = new URL(value, targetUrl).toString();
              return `url("${url.origin}/${absoluteUrl}")`;
            } catch (e) {
              return match;
            }
          }
        );

        // CSS文件：未声明编码则默认UTF-8
        if (!contentType.toLowerCase().includes('charset')) {
          responseHeaders.set('Content-Type', 'text/css; charset=utf-8');
        }

        return new Response(css, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
      }

      // -------------------- 处理JavaScript文件 --------------------
      if (contentType.includes('text/javascript') || contentType.includes('application/javascript')) {
        // JS文件：未声明编码则默认UTF-8
        if (!contentType.toLowerCase().includes('charset')) {
          responseHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
        }
      }

      // -------------------- 处理JSON和纯文本 --------------------
      if (contentType.includes('application/json') || contentType.includes('text/plain')) {
        // JSON和纯文本：未声明编码则默认UTF-8
        if (!contentType.toLowerCase().includes('charset')) {
          responseHeaders.set('Content-Type', `${contentType}; charset=utf-8`);
        }
      }

      // -------------------- 所有其他内容直接流式返回 --------------------
      // 包括：图片、视频、音频、PDF、ZIP、3D模型、WebAssembly等
      // 不做任何处理，确保二进制数据完整
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });

    } catch (error) {
      // 错误处理：返回友好的错误信息
      return new Response(`❌ 网关错误: ${error.message}\n\n正确格式示例：\n- ${url.origin}/google.com\n- ${url.origin}/earth.google.com/web\n- ${url.origin}/http://example.com\n- wss://${url.host}/wss://echo.websocket.org`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }
};

/**
 * 处理WebSocket连接请求
 * @param {Request} request - 原始请求对象
 * @param {string} fullPathAndQuery - 完整路径和查询参数
 * @returns {Response} WebSocket升级响应
 */
async function handleWebSocket(request, fullPathAndQuery) {
  try {
    // 解析目标WebSocket URL
    let targetWsUrl;
    if (fullPathAndQuery.startsWith('ws://') || fullPathAndQuery.startsWith('wss://')) {
      targetWsUrl = new URL(fullPathAndQuery);
    } else {
      // 默认使用wss协议
      const firstSlashIndex = fullPathAndQuery.indexOf('/');
      let targetAuthority, remainingPathAndQuery;
      
      if (firstSlashIndex === -1) {
        targetAuthority = fullPathAndQuery;
        remainingPathAndQuery = '';
      } else {
        targetAuthority = fullPathAndQuery.slice(0, firstSlashIndex);
        remainingPathAndQuery = fullPathAndQuery.slice(firstSlashIndex);
      }
      
      targetWsUrl = new URL(`wss://${targetAuthority}${remainingPathAndQuery}`);
    }

    // 构造WebSocket请求头
    const wsHeaders = new Headers(request.headers);
    wsHeaders.set('Host', targetWsUrl.host);
    wsHeaders.set('Origin', targetWsUrl.origin);
    // 移除Cloudflare特定头
    wsHeaders.delete('CF-Connecting-IP');
    wsHeaders.delete('X-Forwarded-For');

    // 建立到目标服务器的WebSocket连接
    const targetResponse = await fetch(targetWsUrl.toString(), {
      method: 'GET',
      headers: wsHeaders,
      redirect: 'follow'
    });

    // 检查目标服务器是否接受WebSocket升级
    if (!targetResponse.webSocket) {
      return new Response('目标服务器不支持WebSocket', { status: 400 });
    }

    // 获取目标WebSocket连接
    const targetSocket = targetResponse.webSocket;
    // 创建客户端WebSocket连接
    const [clientSocket, serverSocket] = new WebSocketPair();

    // 建立双向数据转发
    targetSocket.accept();
    serverSocket.accept();

    // 客户端 -> 目标服务器
    serverSocket.addEventListener('message', (event) => {
      targetSocket.send(event.data);
    });

    // 目标服务器 -> 客户端
    targetSocket.addEventListener('message', (event) => {
      serverSocket.send(event.data);
    });

    // 连接关闭处理
    serverSocket.addEventListener('close', (event) => {
      targetSocket.close(event.code, event.reason);
    });

    targetSocket.addEventListener('close', (event) => {
      serverSocket.close(event.code, event.reason);
    });

    // 错误处理
    serverSocket.addEventListener('error', (error) => {
      targetSocket.close(1011, '网关错误');
    });

    targetSocket.addEventListener('error', (error) => {
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

/**
 * 转换请求中的Cookie：精确匹配域名层级，遵循浏览器标准
 * @param {string} cookieHeader - 原始请求的Cookie头
 * @param {string} currentHost - 当前正在访问的目标域名
 * @returns {string} 转换后的Cookie头
 */
function transformCookiesForRequest(cookieHeader, currentHost) {
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const resultCookies = [];

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split('=');
    if (!name) continue;
    const value = valueParts.join('=');

    // Cookie命名格式：__py_{原始域名}_{原始名称}
    // 例如：__py_google.com_SID, __py_maps.google.com_NID
    if (name.startsWith('__py_')) {
      const parts = name.slice(5).split('_');
      if (parts.length < 2) continue;
      
      const cookieDomain = parts[0];
      const originalName = parts.slice(1).join('_');

      // 精确域名匹配：遵循浏览器标准
      // 1. 精确匹配：cookieDomain === currentHost
      // 2. 父域匹配：currentHost以.cookieDomain结尾（子域可以访问父域Cookie）
      if (cookieDomain === currentHost || currentHost.endsWith(`.${cookieDomain}`)) {
        resultCookies.push(`${originalName}=${value}`);
      }
    }
  }

  return resultCookies.join('; ');
}

/**
 * 转换响应中的Set-Cookie头：精确保留原始Cookie的所有属性
 * @param {string} setCookieHeader - 原始响应的Set-Cookie头
 * @param {string} pyHost - 我们的网关域名
 * @param {string} currentHost - 当前正在访问的目标域名
 * @returns {string} 转换后的Set-Cookie头
 */
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
        // 移除开头的点号（.google.com -> google.com）
        cookieDomain = attrValue ? attrValue.replace(/^\./, '') : null;
      } else if (lowerAttrName === 'path') {
        cookiePath = attrValue || '/';
      } else if (lowerAttrName !== 'samesite' && lowerAttrName !== 'secure') {
        // 保留其他原始属性（如Expires、Max-Age等）
        otherAttributes.push(attr);
      }
    }

    // 如果Cookie没有指定Domain，使用当前精确域名
    // 这样它就只能被当前域名访问，不会泄露给其他子域
    const effectiveDomain = cookieDomain || currentHost;
    
    // 重命名Cookie，包含原始域名信息
    const pyCookieName = `__py_${effectiveDomain}_${name}`;

    // 构建新Cookie，保留原始Path和所有其他属性
    const newCookie = [
      `${pyCookieName}=${value}`,
      `Domain=${pyHost}`,
      `Path=${cookiePath}`, // 保留原始Path，精确控制Cookie可见范围
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

/**
 * 获取域名的根域（仅用于错误处理，不再用于Cookie共享）
 * @param {string} domain - 完整域名
 * @returns {string} 根域名
 */
function getRootDomain(domain) {
  if (!domain) return 'unknown';
  
  // 移除端口号
  domain = domain.split(':')[0];
  
  // 处理IP地址
  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    return domain;
  }
  
  const parts = domain.split('.');
  
  // 单部分域名（如localhost）
  if (parts.length === 1) {
    return domain;
  }
  
  // 自动识别二级顶级域名（如.co.uk, .com.cn）
  const secondLevelTLDs = ['co', 'com', 'org', 'net', 'edu', 'gov', 'mil', 'ac'];
  const tld = parts[parts.length - 1].toLowerCase();
  const secondLevel = parts[parts.length - 2]?.toLowerCase();
  
  if (parts.length >= 3 && secondLevelTLDs.includes(secondLevel)) {
    return `${parts[parts.length - 3]}.${secondLevel}.${tld}`;
  }
  
  return `${secondLevel}.${tld}`;
}

/**
 * 字符串哈希函数（保留用于兼容性，当前版本未使用）
 * @param {string} str - 输入字符串
 * @returns {string} 十六进制哈希值
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  // 转换为无符号十六进制字符串
  return (hash >>> 0).toString(16);
}
