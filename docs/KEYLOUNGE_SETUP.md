# keylounge.net 部署教程（逐步点击版）

推广域名：**keylounge.net**  
主站：**https://vkeyshop.co**  
落地页文件位置：`f:\my-new-site\promo-landing\`

---

## ⚡ 以后改文案 / 改样式：一条命令部署（不用 zip）

**第一次**（只需做一次）：

1. 在项目根目录打开终端
2. 运行：
   ```bash
   npx wrangler login
   ```
3. 浏览器登录 Cloudflare 账号 → 允许授权

**以后每次改完 `promo-landing/config.js` 或 CSS**：

```bash
cd f:\my-new-site
npm run promo:deploy
```

约 10～30 秒自动上传到 **keylounge-promo**，无需再打包 zip。

改按钮文字：编辑 `promo-landing/config.js` 里的 `CTA`（当前 `Claim Now →`）。

---

## 开始前准备

- [ ] 已在 Hostija 购买并完成付款 `keylounge.net`
- [ ] 有一个邮箱（注册 Cloudflare 用，建议和 Hostija 同一邮箱方便管理）
- [ ] 电脑能打开 `f:\my-new-site\promo-landing\` 文件夹

**预计耗时：** DNS 生效 10 分钟～几小时；操作本身约 20 分钟。

---

# 第一步：把域名接到 Cloudflare（Hostija 改 Nameserver）

## 1.1 注册 / 登录 Cloudflare

1. 浏览器打开：**https://dash.cloudflare.com**
2. 没有账号 → 点 **Sign Up** → 填邮箱、密码 → 去邮箱点验证链接
3. 已有账号 → **Log in** 登录

---

## 1.2 在 Cloudflare 添加站点 keylounge.net

1. 登录后进入控制台首页
2. 右上角或中间大按钮，点 **Add a site**（添加站点）
3. 输入框里**只输入**：

   ```
   keylounge.net
   ```

   ⚠️ 不要加 `https://`，不要加 `www`

4. 点 **Continue**（继续）
5. 选择套餐 → 选 **Free**（免费 $0）→ 点 **Continue**
6. **DNS Records 页面**（导入 DNS 记录）：
   - 新域名一般没有记录，**不用改任何东西**
   - 直接滚动到页面最底部
   - 点 **Continue**（继续）

7. **Nameservers 页面**（最重要）：
   - 你会看到 Cloudflare 分配的 **2 个地址**，类似：

     ```
     xxx.ns.cloudflare.com
     yyy.ns.cloudflare.com
     ```

   - 每个地址右边通常有 **Copy**（复制）按钮 → **分别点 Copy 复制**
   - 或鼠标选中整行 → `Ctrl+C` 复制
   - **把这两个地址记到记事本**（等下 Hostija 要用）

   ⚠️ 每个人分配的不一样，**必须用你页面上显示的那两个**，不要用教程里的示例。

8. 这一页先**不要关**，开新标签页去 Hostija；改完 Hostija 再回来 Cloudflare 点 **Continue**

---

## 1.3 在 Hostija 修改 Nameserver

1. 新标签页打开 Hostija 客户区并登录（你买域名的那个网站）
2. 找到域名列表，常见入口名称：
   - **Domains** / **My Domains** / **域名**
3. 找到 **keylounge.net** → 点 **Manage**（管理）或齿轮图标
4. 左侧或顶部菜单找：
   - **Nameservers** / **DNS Nameservers** / **域名服务器**
5. 把模式从默认（Hostija 自带 NS）改成 **Custom nameservers**（自定义名称服务器）
6. **删除** Hostija 原来的 NS（如果有 2～4 个旧地址）
7. **粘贴** Cloudflare 给你的 2 个地址：
   - 第 1 格：粘贴第一个 `xxx.ns.cloudflare.com`
   - 第 2 格：粘贴第二个 `yyy.ns.cloudflare.com`
8. 点 **Save** / **Update** / **Save Changes**（保存）
9. Hostija 若提示「修改 NS 可能 24～48 小时生效」→ 正常，一般几十分钟内就好

---

## 1.4 回到 Cloudflare 完成激活

1. 切回 Cloudflare 的 Nameservers 那个标签页
2. 点 **Continue** 或 **Done, check nameservers**
3. 等待 Cloudflare 检测（可能立即成功，也可能等几小时）

**怎么算成功：**

1. Cloudflare 左侧点 **Websites**（网站）
2. 列表里 **keylounge.net** 旁边状态是 **Active**（绿色）= 成功
3. 若显示 **Pending**（待处理）= 继续等，Hostija NS 还没同步完，**每 30 分钟刷新一次**，不用重复改

---

# 第二步：上传落地页到 Cloudflare Pages

## 2.1 在电脑上打包要上传的文件

1. 打开文件夹（资源管理器地址栏粘贴回车）：

   ```
   f:\my-new-site\promo-landing
   ```

2. 确认里面能看到这些（**必须有**）：
   - `index.html`
   - `config.js`
   - 文件夹 `assets`
   - 文件夹 `vip`、`card`、`live`、`month` 等

3. **打包成 zip**（Cloudflare 上传 zip 最稳）：
   1. 在 `promo-landing` 文件夹**里面**，按 `Ctrl+A` 全选
   2. 右键 → **压缩为 ZIP 文件** / **发送到 → 压缩(zipped)文件夹**
   3. 得到类似 `promo-landing.zip`（可能在上一级目录 `f:\my-new-site\`）
   4. 双击打开 zip 确认：**第一层就是** `index.html`，而不是「再套一层 promo-landing 文件夹」

   ✅ 正确 zip 结构：
   ```
   promo-landing.zip
   ├── index.html
   ├── config.js
   ├── assets/
   ├── vip/
   └── ...
   ```

   ❌ 错误（多一层文件夹）：
   ```
   promo-landing.zip
   └── promo-landing/
       └── index.html   ← 这样上传后首页会 404
   ```

---

## 2.2 创建 Cloudflare Pages 项目

1. 打开 **https://dash.cloudflare.com**
2. 左侧菜单点 **Workers & Pages**（工作者和 Pages）
3. 右上角或中间点 **Create**（创建）或 **Create application**
4. 上方选 **Pages** 标签
5. 选 **Upload assets**（上传资产）或 **Get started** → **Direct Upload**
   - 不要选 Connect to Git（那是连 GitHub 的，我们不用）

6. **Project name**（项目名称）输入：

   ```
   keylounge-promo
   ```

   （只能英文小写和连字符，随意但建议用这个）

7. **Upload** 区域：
   - 把 `promo-landing.zip` **拖进去**
   - 或点 **Select from computer** → 选中 zip 文件 → 打开

8. 点 **Deploy site** / **Upload** / **Save and deploy**（部署站点）
9. 等进度条跑完（通常 1～3 分钟）
10. 成功后会显示一个临时地址，类似：

    ```
    https://keylounge-promo.pages.dev
    ```

11. **先点这个临时地址测试**：
    - 应打开落地页（18+、Continue to shop 按钮）
    - 点 `/vip` 路径：`https://keylounge-promo.pages.dev/vip/`
    - 临时地址能打开，说明上传成功

---

## 2.3 绑定自定义域名 keylounge.net

1. 仍在 **Workers & Pages** → 点项目名 **keylounge-promo**
2. 顶部标签点 **Custom domains**（自定义域）
3. 点 **Set up a custom domain** / **Add custom domain**
4. 输入框粘贴：

   ```
   keylounge.net
   ```

   ⚠️ 不要加 `https://`

5. 点 **Continue** / **Add domain**
6. 因为域名已在同一 Cloudflare 账号，一般会**自动添加 DNS**，显示 **Active**
7. 若提示确认 → 点 **Activate domain** / **Confirm**

**可选（建议做）：** 再添加 `www.keylounge.net`  
- 同样点 **Add custom domain** → 输入 `www.keylounge.net` → Continue  
- 群发链接**不需要带 www**，用 `https://keylounge.net/card` 即可

---

## 2.4 若 Custom domain 一直 Pending

1. Cloudflare 左侧点 **Websites** → 点 **keylounge.net**
2. 左侧 **DNS** → **Records**
3. 应有一条 **CNAME** 或 Pages 自动记录指向 `keylounge-promo.pages.dev`
4. 若没有，手动添加：
   - 点 **Add record**
   - Type: **CNAME**
   - Name: **@**（或 `keylounge.net`）
   - Target: **keylounge-promo.pages.dev**（你的 Pages 项目地址，在项目 Overview 页能看到）
   - Proxy status: **Proxied**（橙色云）
   - 点 **Save**
5. 等 5～15 分钟再试

---

# 第三步：部署后测试（确认能跳转主站）

## 3.1 测试推广落地页

在浏览器**新开无痕窗口**（避免缓存），依次打开：

| 测试 | 地址 | 期望结果 |
|------|------|----------|
| 1 | https://keylounge.net/ | 18+ 落地页，标题类似 Private VIP Access |
| 2 | https://keylounge.net/vip/ | 同上 |
| 3 | https://keylounge.net/card/ | 标题 Get Your VIP Code |
| 4 | https://keylounge.net/download/ | 标题 Get the App First |

若打不开：
- **DNS 未生效** → 等 1～2 小时再试
- **404** → zip 打包多了一层文件夹，重新按 2.1 打包上传
- **SSL 错误** → Cloudflare SSL 设为 Flexible/Full，等 15 分钟

---

## 3.2 测试跳转到主站

1. 打开 https://keylounge.net/card/
2. 点大按钮 **Continue to shop**
3. 地址栏应变成 **https://vkeyshop.co/** 且带 `utm_source=broadcast` 等参数
4. 再测 https://keylounge.net/download/ → 按钮应跳到 **https://vkeyshop.co/download**
5. 再测 https://keylounge.net/order/ → 按钮应跳到 **https://vkeyshop.co/orders/lookup**

全部通过 = 部署完成，可以群发。

---

## 3.3 后台 Supabase（可选，方便对照链接）

1. 打开 Supabase 项目 → **SQL Editor**
2. 打开本地文件 `f:\my-new-site\supabase-migration-promo-links.sql`
3. 全选复制 → 粘贴到 SQL Editor → 点 **Run**
4. 登录 **admin.vkeyshop.co** → **快捷按钮**
5. 能看到 10 条 `[Promo]` 记录（状态为「隐藏」= 正常，不会显示在主站首页）

---

# 群发链接清单（复制即用）

```
https://keylounge.net/vip/
https://keylounge.net/card/
https://keylounge.net/live/
https://keylounge.net/month/
https://keylounge.net/season/
https://keylounge.net/year/
https://keylounge.net/trial/
https://keylounge.net/download/
https://keylounge.net/support/
https://keylounge.net/order/
```

WhatsApp 最常用：

```
https://keylounge.net/card
```

---

# 常见问题

**Q：Hostija 找不到 Nameservers？**  
在域名 Manage 里找 DNS / Nameservers / Domain settings；或 Hostija 工单问「how to change nameservers for keylounge.net」。

**Q：Cloudflare 一直 Pending？**  
Hostija 的 NS 是否已保存为 Cloudflare 两个地址；用 https://dnschecker.org 查 `keylounge.net` NS 是否已是 `*.ns.cloudflare.com`。

**Q：以后改落地页文案？**  
改 `promo-landing/config.js` → 运行 `npm run promo:deploy`（见文档顶部，不用 zip）。

**Q：以前改 zip 上传还能用吗？**  
可以，但推荐 `npm run promo:deploy` 更快。

**Q：群发能不能直接发 vkeyshop.co？**  
不要。只发 `keylounge.net` 链接。

---

部署完成后把测试结果发我（哪一步卡住、截图或报错文字），我可以帮你排查。
