# ITXT 聚合支付（微信 / 支付宝商户户）

对接文档：[ITXT 公开 API 文档](http://ng9JyL0FSGD7tGBPfV.itxt002.xyz/#/publicapidoc)

微信、支付宝共用同一套签名与网关，仅 `channelCode` 不同。

## 一次性部署（Supabase）

在 SQL Editor 依次执行（若已跑过可只跑 itxt-pay）：

1. `supabase-migration-itxt-pay.sql` — 创建通道并 **写入商户配置**

| 通道 | channel_code |
|------|----------------|
| 微信 `wechat` | `1111` |
| 支付宝 `alipay` | `111` |

共用：`mid` = `M200044`，网关 `http://RfBseViEKZlMAmu7ArWO.itxt002.xyz`，回调 IP `136.110.35.126`。

执行后到 Admin → **Payments** 勾选 **Enabled** 即可上线（配置已预填）。

> **安全提示**：秘钥写在 SQL 迁移里是为了方便首次部署。若 GitHub 仓库为公开，建议在支付方后台 **轮换秘钥**，并只在 Supabase / 后台修改，勿再提交明文秘钥。

## 后台字段说明

| 字段 | 说明 |
|------|------|
| `mid` | 商户号 |
| `merchant_secret` | 商户秘钥 |
| `api_base_url` | 网关根地址（创建/查单 API 的域名） |
| `channel_code` | 通道编码（微信 1111 / 支付宝 111） |
| `exchange_rate` | 可选。商品价为 USD 时填汇率；留空则按 CNY 元提交 |
| `callback_ips` | 支付方回调服务器 IP，逗号分隔；留空则不校验 |

## 回调地址（notifyUrl）

**不能带 URL 参数**，在支付方登记：

| 通道 | 回调 URL |
|------|----------|
| 微信 | `https://vkeyshop.co/api/payments/webhook/wechat` |
| 支付宝 | `https://vkeyshop.co/api/payments/webhook/alipay` |

成功需返回纯文本：`success`

## API 端点（代码内默认）

| 用途 | URL |
|------|-----|
| 创建订单 | `…/api/services/app/Api_PayOrder/CreateOrderPay` |
| 订单查询 | `…/api/services/app/Api_PayOrder/QueryPayOrder` |

## 签名算法

1. 非空参数按 key **ASCII 字典序**排序  
2. 拼接 `key1=value1&key2=value2&…&{商户秘钥}`（秘钥前有 `&`，无 key 名）  
3. 对整个字符串 **MD5**（大小写不敏感）

## 流程

Checkout 选微信/支付宝 → 跳转 `payUrl` → JSON 回调验签发卡 → `/payment/return` 查单兜底。

## 金额

API 的 `money` 为 **人民币元**。Storefront 若为 USD 标价，请填 `exchange_rate` 或改商品价为 CNY。

## 支付方账户安全

登录支付方后台后请 **修改默认密码** 并 **绑定谷歌验证码**（支付方系统要求）。
