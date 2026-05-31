# 上线自测清单（vkeyshop.co）

按顺序逐项测试。**哪一步失败就截图**（整页 + 浏览器地址栏 + 如有报错请展开 Network / Console），发给开发排查。

---

## 0. 部署前提

- [ ] Vercel 已部署最新 `main` 分支
- [ ] Supabase 已执行 `supabase-migration-security-hardening.sql`
- [ ] Supabase 已执行 `supabase-migration-payment-channels-future.sql`（新支付通道占位）
- [ ] Vercel 环境变量：`SUPABASE_SERVICE_ROLE_KEY`、`CRON_SECRET`、USDT 相关、`RESEND_API_KEY` + `EMAIL_FROM`（若要测邮件）

---

## 1. 主站浏览

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1.1 | 打开 https://vkeyshop.co | 首页正常，商品列表有数据 |
| 1.2 | 切换 EN / 中文 | 文案切换正常 |
| 1.3 | 点进任意商品 → 购买 | 进入 checkout 页 |

---

## 2. 结账与 USDT 直付（核心）

| 步骤 | 操作 | 预期 |
|------|------|------|
| 2.1 | Checkout 填 **邮箱** + 选 **Direct USDT** | 能进入 USDT 支付页 |
| 2.2 | 支付页显示 **唯一金额**（6 位小数）和 TRC20 地址 | 地址与后台配置一致 |
| 2.3 | 向该地址转 **精确金额** USDT | 3～30 秒内状态变 paid / 跳转卡密页 |
| 2.4 | 卡密页要求 **再次输入结账邮箱** | 输入正确邮箱后显示卡密 |
| 2.5 | 输入 **错误邮箱** | 提示不匹配，不显示卡密 |

---

## 3. 邮件发卡（若已配 Resend）

| 步骤 | 操作 | 预期 |
|------|------|------|
| 3.1 | 用真实邮箱完成一笔 USDT 订单 | 1～2 分钟内收到邮件 |
| 3.2 | 邮件含卡密 + 「View your order online」链接 | 点开链接带 `orderId` 和 `email`，**直接显示卡密**（无需再填邮箱） |
| 3.3 | 仅填手机号、不填邮箱下单 | 订单正常完成，**无邮件**（符合设计） |

---

## 4. 订单查询

| 步骤 | 操作 | 预期 |
|------|------|------|
| 4.1 | 打开 `/orders/lookup`，输入结账邮箱 | 列出该邮箱的已付订单 |
| 4.2 | 点订单链接 | 跳转卡密页并带 email 参数 |

---

## 5. Cron 扫链（备用）

| 步骤 | 操作 | 预期 |
|------|------|------|
| 5.1 | cron-job.org → Run now | History 显示 **200**，body 含 `"ok":true` |
| 5.2 | 浏览器直接打开 cron URL（无 Header） | **401 Unauthorized**（正常，说明密钥不在 URL 里） |

详见 [CRON_SETUP.md](./CRON_SETUP.md)。

---

## 6. 安全抽检

| 步骤 | 操作 | 预期 |
|------|------|------|
| 6.1 | 未登录访问 `https://vkeyshop.co/admin` | 跳转登录或 404（视域名） |
| 6.2 | 在 admin 未登录时访问 `/admin/customers/export` | 拒绝访问 |
| 6.3 | 随便猜 `orderId` 打开 `/cards?orderId=xxx` 不填邮箱 | 只显示验证表单，**无卡密** |
| 6.4 | DevTools 用 anon key 请求 `rest/v1/cards?select=code` | 失败或空（RLS 生效） |

详见 [SECURITY.md](./SECURITY.md)。

---

## 7. 后台管理（admin.vkeyshop.co）

| 步骤 | 操作 | 预期 |
|------|------|------|
| 7.1 | 登录后台 | 进入仪表盘 |
| 7.2 | **Payments** | 能看到 USDT + Stripe + 微信/支付宝/PayPal 个人/商业 等通道（新通道默认 **未启用**） |
| 7.3 | 改商品名 / 保存 | 保存成功，前台刷新可见 |
| 7.4 | **Customers** → 导出 CSV | 需登录 admin，下载成功 |

---

## 8. 推广站 keylounge.net（可选）

| 步骤 | 操作 | 预期 |
|------|------|------|
| 8.1 | 打开 https://keylounge.net | 英文落地页正常 |
| 8.2 | CTA 链到 vkeyshop.co | 跳转正确 |

---

## 常见问题 → 截图要点

| 现象 | 请截图 |
|------|--------|
| USDT 付了不到账 | 支付页整屏 + 订单号 + Tron 转账哈希 |
| 卡密页验证失败 | 结账时用的邮箱/手机 + 卡密页输入内容 |
| Cron 401 | cron-job.org Headers 配置 + Vercel CRON_SECRET 是否 Redeploy |
| 收不到邮件 | Vercel 是否有 RESEND_API_KEY / EMAIL_FROM + Resend 域名验证状态 |
| 后台保存支付通道失败 | 完整报错 + 是否已跑 payment-channels-future SQL |
