# USDT 扫链 Cron 配置教程（cron-job.org）

定时任务的作用：每隔几分钟访问一次你的服务器，检查 Tron 链上是否收到 USDT，收到后自动发卡。

**安全更新后**：密钥不能写在网址里（`?secret=xxx`），必须放在 **HTTP 请求头** 里。

---

## 第一步：确认 Vercel 里有 CRON_SECRET

1. 打开 **https://vercel.com** 并登录
2. 点进你的项目（vkeyshop 主站）
3. 顶部 **Settings** → 左侧 **Environment Variables**
4. 找变量名 **`CRON_SECRET`**

| 情况 | 怎么做 |
|------|--------|
| **已有** | 点 **Reveal** 或眼睛图标，**复制整段值** 到记事本（等下要用） |
| **没有** | 点 **Add New** → Name 填 `CRON_SECRET` → Value 填一串随机密码（见下方）→ 勾选 Production → **Save** → 再 **Redeploy** 一次项目 |

**生成随机密码（PowerShell 里运行）：**

```powershell
-join ((48..57 + 65..90 + 97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

复制输出的一串字符，作为 `CRON_SECRET` 的值。

⚠️ **Vercel 里的 CRON_SECRET** 和 **cron-job.org 请求头里填的值** 必须完全一致（一个字符都不能差）。

---

## 第二步：登录 cron-job.org 并找到旧任务

1. 打开 **https://cron-job.org** 并登录
2. 左侧或首页 **Cronjobs**（定时任务列表）
3. 找到访问 `vkeyshop.co/api/payments/cron/tron-watch` 的那一条
4. 点任务名称或 **Edit**（编辑）进入编辑页

---

## 第三步：改 URL（去掉 ?secret=）

找到 **URL / Address** 输入框。

**错误（旧方式，不要再这样）：**

```
https://vkeyshop.co/api/payments/cron/tron-watch?secret=abc123xyz
```

**正确：**

```
https://vkeyshop.co/api/payments/cron/tron-watch
```

操作：

1. 删除网址里 **`?secret=` 及后面全部内容**
2. 只保留：`https://vkeyshop.co/api/payments/cron/tron-watch`
3. 先不要点保存

---

## 第四步：添加 Authorization 请求头（核心）

在编辑页找下面之一（不同界面用词可能略有不同）：

- **Advanced** → **Request headers**
- **HTTP Headers**
- **Custom headers**
- **Headers**

### 如果没有 Headers 选项

1. 找 **Advanced settings** / **Show advanced** 并展开
2. 或任务类型选 **Advanced** / **HTTP request**（不要选最简单的 “URL only”）

### 添加一行 Header

| 字段 | 填什么 |
|------|--------|
| **Header name** / **Name** | `Authorization` |
| **Header value** / **Value** | `Bearer 你的CRON_SECRET` |

**Value 格式（注意空格）：**

```
Bearer xK9mP2vL8nQ4wR7tY1uI0oA3sD6fG5hJ
```

规则：

- 单词 **`Bearer`** 后面 **必须有一个空格**
- 空格后面粘贴 **Vercel 里 CRON_SECRET 的完整值**
- **不要**加引号
- **不要**在末尾再加 `?secret=`

**示例：**

若 CRON_SECRET 是 `mySecretKey2024abc`，则 Value 填：

```
Bearer mySecretKey2024abc
```

---

## 第五步：其他设置（对照检查）

| 设置项 | 建议值 |
|--------|--------|
| **Schedule** | 每 **1～5 分钟** 一次（如 `*/3 * * * *` = 每 3 分钟） |
| **Request method** | **GET** |
| **Enabled** | 开启 ✓ |
| **Timeout** | 30 秒或以上 |

点 **Save** / **Update cronjob** 保存。

---

## 第六步：手动测试是否成功

### 方法 A：在 cron-job.org 里点 “Run now”

1. 任务列表里找到该 Cron
2. 点 **Run now** / **Execute now** / **▶**
3. 看 **History** / **Execution log**

**成功：** 状态 200，响应类似：

```json
{"ok":true,"fulfilled":0,"checked":1}
```

`fulfilled:0` 表示这次没有新订单需要发卡，**也是正常的**。

**失败：**

| 响应 | 原因 |
|------|------|
| `401` + `"Unauthorized"` | Authorization 头错了，或 Vercel 没配 CRON_SECRET |
| `404` | URL 写错，或 Vercel 还没部署最新代码 |
| `500` | 服务器内部错误，看 Vercel 日志 |

### 方法 B：在自己电脑 PowerShell 测试

把 `你的CRON_SECRET` 换成 Vercel 里的真实值：

```powershell
$secret = "你的CRON_SECRET"
Invoke-WebRequest -Uri "https://vkeyshop.co/api/payments/cron/tron-watch" -Headers @{ Authorization = "Bearer $secret" } -UseBasicParsing
```

**成功：** 状态码 **200**，内容含 `"ok":true`。

**失败 401：** 密钥不一致或请求头格式不对。

---

## 常见错误对照

| 现象 | 处理 |
|------|------|
| 浏览器直接打开 URL 显示 Unauthorized | **正常** — 浏览器不会带 Bearer 头 |
| 忘了 Bearer 后面的空格 | Value 必须是 `Bearer␠密钥`，不是 `Bearer密钥` |
| Vercel 改了 CRON_SECRET 但没 Redeploy | Settings → Deployments → 最新部署 → **Redeploy** |
| cron 和 Vercel 密钥不一致 | 两边复制粘贴同一串，不要手打 |
| 仍用 `?secret=` | 删掉，只保留 Header 方式 |

---

## 不用 cron-job.org 时

任何支持 **自定义 HTTP Header** 的定时服务都可以，原则相同：

- **URL：** `https://vkeyshop.co/api/payments/cron/tron-watch`
- **Method：** GET
- **Header：** `Authorization: Bearer <CRON_SECRET>`

---

## 和支付页轮询的关系

即使 Cron 暂时 401，用户在 **USDT 支付页等待** 时，前端每 3 秒也会触发扫链（`/api/payments/status`），多数订单仍能自动发卡。

Cron 是 **备用**，建议配好，防止用户关页面后漏单。

---

## 检查清单

- [ ] Vercel 有 `CRON_SECRET` 且已 Redeploy
- [ ] cron-job.org URL **没有** `?secret=`
- [ ] Header：`Authorization` = `Bearer + 空格 + 密钥`
- [ ] Run now 返回 200 和 `"ok":true`
