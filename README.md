# CF-Web-py
# Cloudflare 全球加速网关
基于 Cloudflare Workers 构建的高速通用网关，利用 Cloudflare 全球 200+ 边缘节点加速访问，完美解决各种兼容性问题，支持所有网站和 WebSocket 长连接。

<div align="center">
  <a href="https://github.com/ZhuangMS-Theo/CF-Web-py/blob/main/EXPLANATION.md" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0;">
    📚 查看完整代码讲解
  </a>
</div>

## ✨ 核心功能
| 功能 | 详细说明 |
|------|----------|
| 🔒 **双协议支持** | 同时支持 HTTP 和 HTTPS 协议，自动处理协议转换 |
| 🔌 **任意端口支持** | 支持访问任意自定义端口的网站，包括非标准端口 |
| 🍪 **完美Cookie处理** | 精确域名层级匹配，无串扰，支持所有单点登录系统 |
| ✅ **智能编码处理** | 所有人机验证页面强制UTF-8，彻底解决中文乱码问题 |
| 🖼️ **全资源支持** | 图片、视频、音频、PDF、ZIP、3D模型、WebAssembly全部完美加载 |
| 🔗 **无限嵌套跳转** | 支持无限层级的页面跳转和资源加载，相对链接自动转换 |
| 🌍 **谷歌地球3D** | 完整支持谷歌地球Web版的3D全景、街景和时间轴功能 |
| ⚡ **全球加速** | 利用Cloudflare全球边缘节点，就近访问，降低延迟 |
| 🔄 **WebSocket支持** | 完整支持WebSocket双向长连接，透明转发所有数据 |
| 🛡️ **安全头处理** | 自动移除限制性安全头，解决各种跨域和资源加载问题 |

## 🛠️ 已修复的问题
1. **Cookie串扰问题**
   - 问题：同一根域下不同子域的Cookie混在一起，导致权限混乱
   - 修复：实现精确的域名层级匹配，子域只能访问父域Cookie，反之不行
   - 效果：谷歌地图和谷歌主站的Cookie完全隔离，第三方单点登录正常工作

2. **人机验证乱码问题**
   - 问题：谷歌reCAPTCHA等验证框中文显示为乱码
   - 修复：所有包含`recaptcha`、`captcha`、`challenge`、`verify`的页面强制使用UTF-8编码
   - 效果：所有人机验证系统的中文文字都能正常显示

3. **相对链接加载问题**
   - 问题：嵌套页面中的相对链接无法正确解析，导致资源加载失败
   - 修复：自动将所有相对链接转换为基于当前页面URL的绝对链接
   - 效果：无论嵌套多少层，所有资源都能正确加载

4. **谷歌地球3D加载问题**
   - 问题：CSP、X-Frame-Options等安全头阻止3D瓦片加载
   - 修复：自动移除所有限制性安全头
   - 效果：谷歌地球3D建筑、地形、街景全部正常显示

5. **二进制文件损坏问题**
   - 问题：图片、视频等二进制文件被错误地作为文本处理，导致损坏
   - 修复：所有非文本内容直接流式传输，不做任何修改
   - 效果：所有格式的文件都能完整下载和显示

6. **第三方单点登录问题**
   - 问题：第三方网站无法通过Google账号登录
   - 修复：精确匹配Cookie的Domain和Path属性
   - 效果：所有支持Google单点登录的网站都能正常登录

7. **WebSocket不支持问题**
   - 问题：无法建立WebSocket长连接
   - 修复：添加完整的WebSocket双向透明转发功能
   - 效果：所有使用WebSocket的网站和应用都能正常工作

## 🚀 详细部署步骤
### 准备工作
1. 注册一个 [Cloudflare 账号](https://dash.cloudflare.com/signup)（免费版即可）
2. （可选）拥有一个域名，并将其DNS托管到Cloudflare

### 步骤1：创建Cloudflare Worker
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. 在左侧导航栏中点击 **Workers & Pages**
3. 点击右上角的 **Create application** 按钮
4. 选择 **Create Worker** 选项卡
5. 在 **Worker name** 输入框中输入一个名称（例如 `global-gateway`）
6. 点击 **Deploy** 按钮，完成初步部署

### 步骤2：部署代码
1. 在部署成功页面，点击 **Quick edit** 按钮
2. 删除代码编辑器中所有默认代码
3. 粘贴本项目的完整代码
4. 点击右上角的 **Save and deploy** 按钮
5. 等待部署完成（通常需要几秒钟）

### 步骤3：验证基础部署
1. 部署完成后，你会看到一个类似 `https://global-gateway.your-username.workers.dev` 的地址
2. 点击这个地址，应该能看到网关的首页使用说明界面
3. 测试访问：在地址后添加 `/google.com`，应该能正常打开谷歌主页

### 步骤4：绑定自定义域名（推荐）
1. 返回Worker详情页，点击顶部的 **Settings** 选项卡
2. 在左侧导航栏中点击 **Triggers**
3. 向下滚动到 **Custom Domains** 部分，点击 **Add Custom Domain**
4. 输入你想要使用的域名（例如 `gw.example.com`）
5. 点击 **Continue** 按钮
6. Cloudflare会自动为你添加DNS记录，点击 **Activate Domain** 按钮
7. 等待DNS生效（通常需要几分钟）
8. 生效后，你就可以通过你的自定义域名访问网关了

## 📖 完整使用方法
### 基础访问格式
在你的网关域名后添加目标地址即可：
以部署域名以
https://gw.example.com/
为例子，此域名非任何demo，仅适用于例示而已。

### 各种场景示例
| 场景 | 示例 |
|------|------|
| 默认HTTPS访问 | `https://gw.example.com/google.com` |
| 指定HTTP访问 | `https://gw.example.com/http://example.com` |
| 自定义端口访问 | `https://gw.example.com/example.com:8080` |
| HTTP+自定义端口 | `https://gw.example.com/http://localhost:3000` |
| 带路径和查询参数 | `https://gw.example.com/google.com/search?q=cloudflare` |
| 谷歌地球3D | `https://gw.example.com/earth.google.com/web` |
| WebSocket连接 | `wss://gw.example.com/wss://echo.websocket.org` |
| 明文WebSocket | `wss://gw.example.com/ws://example.com:8080` |
| 本地开发服务器 | `https://gw.example.com/localhost:5173` |

### 特殊说明
- 所有目标地址都可以带完整的路径和查询参数
- WebSocket连接必须使用`wss://`协议访问网关，即使目标是`ws://`
- 访问本地开发服务器时，确保你的本地服务正在运行

## 🔧 技术实现细节
### Cookie处理机制
- **Cookie命名格式**：`__py_{原始域名}_{原始名称}`
  - 例如：`__py_google.com_SID`、`__py_maps.google.com_NID`
- **域名匹配规则**：
  1. 精确匹配：只有域名完全相同的Cookie才会被发送
  2. 父域匹配：子域可以访问父域的Cookie（符合浏览器标准）
- **属性保留**：完整保留原始Cookie的Path、Expires、Max-Age等所有属性
- **安全设置**：所有Cookie都自动添加Secure、SameSite=Lax和HttpOnly属性

### 智能编码处理逻辑
编码优先级从高到低：
1. **人机验证强制UTF-8**：所有包含验证关键词的页面，无论原网站声明什么编码，都强制使用UTF-8
2. **响应头声明的编码**：如果原网站在`Content-Type`头中指定了`charset`，使用该编码
3. **HTML中声明的编码**：如果响应头没有指定，检测HTML中的`<meta charset>`标签
4. **默认UTF-8**：以上都没有的情况下，默认使用UTF-8编码

### 链接重写机制
- **绝对链接**：直接重写为网关格式
- **相对链接**：基于当前页面URL转换为绝对链接后再重写
- **响应式图片srcset**：逐个重写每个图片源
- **CSS中的url()**：同时处理内联样式和独立CSS文件中的url()函数
- **特殊协议跳过**：锚点、mailto、tel、javascript等协议不做处理

### WebSocket实现原理
1. **升级检测**：自动检测请求头中的`Upgrade: websocket`字段
2. **目标连接**：建立到目标WebSocket服务器的连接
3. **双向转发**：在客户端和目标服务器之间建立透明的双向数据通道
4. **事件处理**：自动处理message、close、error等所有WebSocket事件
5. **头信息保留**：完整保留原始WebSocket握手的所有头信息

## 🔍 字符替换说明
**出于安全考虑，代码中已移除所有敏感字样**：
- 所有中文"代理"、"反向代理"字样 → 替换为"网关"、"加速网关"
- 所有英文"proxy"字样 → 替换为"py"（无特殊含义的随机字符）
- Cookie前缀从 `__proxy_` → 改为 `__py_`
- 所有变量名、函数名和注释中的相关字样都已完成替换

这样做的目的是降低被网络检测和限制的风险，提高网关的可用性。

## ⚠️ 注意事项与限制
### 合法合规
- 本项目仅用于合法合规用途，请严格遵守当地法律法规
- 禁止用于访问违法违规内容
- 用户对自己的使用行为负全部责任

### 隐私安全
- 所有Cookie和登录信息仅存储在您的本地浏览器中
- 网关服务器不存储任何用户数据或登录凭证
- 所有数据传输都通过Cloudflare的加密通道进行

### Cloudflare Workers平台限制
- 单个请求最大响应体：100MB
- WebSocket连接最长保持时间：10分钟（超时后会自动断开）
- 每日免费请求次数：100,000次（免费版）
- 不支持WebSocket扩展（如permessage-deflate压缩）
- 不支持UDP协议

### 兼容性说明
- 支持所有现代浏览器（Chrome、Edge、Firefox、Safari）
- 极少数使用JavaScript动态生成绝对链接的单页应用可能需要额外处理
- 不支持需要客户端证书的网站
- 不支持FTP协议

### 性能说明
- 加载速度取决于您所在地区的Cloudflare节点质量
- 目标网站的速度也会影响最终体验
- 静态资源会被Cloudflare自动缓存，加速后续访问

## 📄 许可证
MIT License
