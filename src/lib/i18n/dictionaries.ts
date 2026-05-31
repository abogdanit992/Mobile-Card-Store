import type { Locale } from "./config";

export type Dict = {
  brand: string;
  membersOnly: string;
  vipZone: string;
  vipZoneDesc: string;
  featured: string;
  instantDelivery: string;
  softwareDownload: string;
  hubDownload: string;
  backupDownload: string;
  queryOrder: string;
  noProducts: string;
  buyNow: string;
  get: string;
  // nav
  navHome: string;
  navAccount: string;
  navQuery: string;
  navFaq: string;
  navService: string;
  // faq + support
  faqTitle: string;
  faqSubtitle: string;
  faqEmpty: string;
  supportTitle: string;
  supportUnavailable: string;
  supportChooseTitle: string;
  supportWebChat: string;
  supportWhatsApp: string;
  supportCancel: string;
  // download page
  downloadTitle: string;
  downloadSubtitle: string;
  officialHub: string;
  mainDownload: string;
  backupAddress: string;
  boxApps: string;
  boxAppsDesc: string;
  streamingApps: string;
  streamingDesc: string;
  buyCard: string;
  detailPage: string;
  cloudBackup: string;
  // checkout
  checkout: string;
  confirmOrder: string;
  orderInfo: string;
  contactInfo: string;
  contactInfoHint: string;
  email: string;
  phone: string;
  emailHint: string;
  phoneHint: string;
  emailOptional: string;
  phoneOptional: string;
  atLeastOneContact: string;
  selectPayment: string;
  noPaymentChannels: string;
  payWith: string;
  pay: string;
  invalidEmail: string;
  invalidPhone: string;
  selectChannelFirst: string;
  usdReference: string;
  cnyRateHint: string;
  cnyRateMissing: string;
  // generic
  back: string;
  backHome: string;
  loading: string;
  cancel: string;
  // lookup
  lookupTitle: string;
  lookupSubtitle: string;
  lookupQuery: string;
  lookupNeedOne: string;
  lookupNotFound: string;
  // account
  accountTitle: string;
  accountSubtitle: string;
  loginPrompt: string;
  login: string;
  register: string;
  lookupHint: string;
  verifiedEmail: string;
  signOut: string;
  myOrders: string;
  noOrders: string;
  viewCard: string;
  // cards
  myCards: string;
  cardDelivery: string;
  keepSafe: string;
  finishPaymentFirst: string;
  yourVipCode: string;
  order: string;
  cardNotAllocated: string;
  saveScreenshot: string;
  copyCode: string;
  copied: string;
  tapToCopy: string;
  keepShopping: string;
  // card verification (option B)
  cardVerifyTitle: string;
  cardVerifyHint: string;
  cardVerifySubmit: string;
  cardVerifyMismatch: string;
  cardOrderNotPaid: string;
  rateLimitExceeded: string;
  // direct USDT
  usdtPayTitle: string;
  usdtPaySubtitle: string;
  usdtNotConfigured: string;
  usdtNetwork: string;
  usdtSendExactly: string;
  usdtDecimalWarning: string;
  usdtWalletAddress: string;
  usdtWaiting: string;
  usdtWaitingHint: string;
  usdtExpired: string;
  usdtExpiredHint: string;
  usdtImportant: string;
  usdtImportantHint: string;
};

const en: Dict = {
  brand: "VIP Lounge",
  membersOnly: "Members Only",
  vipZone: "VIP Activation Cards",
  vipZoneDesc: "Instant delivery after payment · Private & secure · 24/7",
  featured: "Featured",
  instantDelivery: "Instant delivery · Private & secure activation",
  softwareDownload: "Downloads",
  hubDownload: "App Hub",
  backupDownload: "Backup",
  queryOrder: "Track Order",
  noProducts: "No products yet. Add them in the admin.",
  buyNow: "Buy Now",
  get: "Buy",
  navHome: "Home",
  navAccount: "Account",
  navQuery: "Track",
  navFaq: "FAQ",
  navService: "Support",
  faqTitle: "FAQ",
  faqSubtitle: "Common questions & answers",
  faqEmpty: "No FAQs yet.",
  supportTitle: "Online Support",
  supportUnavailable: "Live chat is being set up. Please check back soon.",
  supportChooseTitle: "How would you like to reach us?",
  supportWebChat: "Live chat",
  supportWhatsApp: "WhatsApp",
  supportCancel: "Cancel",
  downloadTitle: "Downloads",
  downloadSubtitle: "Box apps · Streaming platforms",
  officialHub: "Official download hub",
  mainDownload: "Main site",
  backupAddress: "Backup address",
  boxApps: "Box Apps",
  boxAppsDesc: "Install the app, then activate with a card from the store",
  streamingApps: "Streaming Apps",
  streamingDesc: "Opens the detail page when no direct link is available",
  buyCard: "Buy Card",
  detailPage: "Details",
  cloudBackup: "Cloud / Backup",
  checkout: "Checkout",
  confirmOrder: "Confirm Order",
  orderInfo: "Order details",
  contactInfo: "Contact info",
  contactInfoHint: "No account needed — enter email or phone to receive & track your card.",
  email: "Email",
  phone: "Phone",
  emailHint: "Card is emailed here (recommended)",
  phoneHint: "For order lookup",
  emailOptional: "Email (recommended)",
  phoneOptional: "Phone (optional)",
  atLeastOneContact: "Please enter an email or a phone number",
  selectPayment: "Select payment method",
  noPaymentChannels: "No payment method available. Please contact support.",
  payWith: "Pay with",
  pay: "Pay",
  invalidEmail: "Please enter a valid email",
  invalidPhone: "Please enter a valid phone",
  selectChannelFirst: "Please select a payment method",
  usdReference: "List price",
  cnyRateHint: "USD→CNY rate",
  cnyRateMissing: "WeChat/Alipay needs USD→CNY exchange rate in admin. Please contact support.",
  back: "Back",
  backHome: "Back to home",
  loading: "Loading…",
  cancel: "Cancel",
  lookupTitle: "Track Order",
  lookupSubtitle: "Look up by the email or phone you used",
  lookupQuery: "Search",
  lookupNeedOne: "Enter the email or phone you used at checkout",
  lookupNotFound: "No orders found",
  accountTitle: "Account",
  accountSubtitle: "Account & orders",
  loginPrompt: "Register and verify your email to view your order history here.",
  login: "Sign in",
  register: "Sign up",
  lookupHint: "Not logged in? Look up by email →",
  verifiedEmail: "Verified email",
  signOut: "Sign out",
  myOrders: "My orders",
  noOrders: "No orders yet. Browse the store.",
  viewCard: "View card →",
  myCards: "My Cards",
  cardDelivery: "Your Activation Card",
  keepSafe: "Keep this code private",
  finishPaymentFirst: "Please complete payment first",
  yourVipCode: "Your VIP Code",
  order: "Order",
  cardNotAllocated: "No card allocated to this order yet",
  saveScreenshot: "Keep private · activate in the app",
  copyCode: "Copy code",
  copied: "Copied!",
  tapToCopy: "Tap the code or button to copy",
  keepShopping: "Keep shopping",
  cardVerifyTitle: "Verify your order",
  cardVerifyHint:
    "Enter the same email or phone you used at checkout to view your activation code.",
  cardVerifySubmit: "View my code",
  cardVerifyMismatch: "We couldn't verify this order. Check your email or phone.",
  cardOrderNotPaid: "Payment not confirmed yet. Wait a moment and try again.",
  rateLimitExceeded: "Too many requests. Please wait a minute and try again.",
  usdtPayTitle: "Pay with USDT",
  usdtPaySubtitle: "TRC20 · exact amount required",
  usdtNotConfigured: "USDT direct payment is not configured.",
  usdtNetwork: "USDT · TRC20",
  usdtSendExactly: "Send exactly this amount",
  usdtDecimalWarning:
    "Amount must match exactly — all 6 digits after the decimal (e.g. 12.037412). Rounding or sending 12.00 / 12.04 will NOT auto-deliver your card.",
  usdtWalletAddress: "Receiving address (TRC20)",
  usdtWaiting: "Waiting for payment…",
  usdtWaitingHint: "Card is delivered automatically after on-chain confirmation (usually 1–3 min).",
  usdtExpired: "Payment window expired",
  usdtExpiredHint: "Please place a new order. Do not send to this amount anymore.",
  usdtImportant: "Important",
  usdtImportantHint:
    "Use TRC20 network only. Tap the amount above to copy — paste it as-is in your wallet. Wrong network, wrong amount, or edited decimals may fail auto delivery. Contact support with your tx hash if needed.",
};

const zh: Dict = {
  brand: "VIP Lounge",
  membersOnly: "会员专区",
  vipZone: "VIP 激活卡专区",
  vipZoneDesc: "付款后即时发卡 · 私密安全 · 全天候",
  featured: "精选",
  instantDelivery: "即时发卡 · 私密安全开通",
  softwareDownload: "软件下载",
  hubDownload: "聚合下载",
  backupDownload: "备用下载",
  queryOrder: "查询订单",
  noProducts: "暂无商品，请先在后台上架",
  buyNow: "立即购买",
  get: "购买",
  navHome: "首页",
  navAccount: "我的",
  navQuery: "查单",
  navFaq: "常见问题",
  navService: "在线客服",
  faqTitle: "常见问题",
  faqSubtitle: "常见问题与解答",
  faqEmpty: "暂无常见问题。",
  supportTitle: "在线客服",
  supportUnavailable: "在线客服正在接入，请稍后再试。",
  supportChooseTitle: "请选择联系方式",
  supportWebChat: "网页在线客服",
  supportWhatsApp: "WhatsApp",
  supportCancel: "取消",
  downloadTitle: "软件下载",
  downloadSubtitle: "盒子 App · 直播平台",
  officialHub: "官方下载站",
  mainDownload: "主站下载",
  backupAddress: "备用地址",
  boxApps: "直播盒子 App",
  boxAppsDesc: "先安装 App，再到本站购买卡密激活",
  streamingApps: "直播平台 App",
  streamingDesc: "无直链时跳转详情页",
  buyCard: "购买卡密",
  detailPage: "详情页",
  cloudBackup: "网盘/备用",
  checkout: "结算",
  confirmOrder: "确认订单",
  orderInfo: "订单信息",
  contactInfo: "联系信息",
  contactInfoHint: "无需注册——填写邮箱或手机号即可接收并查询卡密。",
  email: "邮箱",
  phone: "手机号",
  emailHint: "卡密将发送到此邮箱（推荐）",
  phoneHint: "用于订单查询",
  emailOptional: "邮箱（推荐）",
  phoneOptional: "手机号（可选）",
  atLeastOneContact: "请至少填写邮箱或手机号其一",
  selectPayment: "选择支付方式",
  noPaymentChannels: "暂无可用支付方式，请联系客服。",
  payWith: "使用",
  pay: "支付",
  invalidEmail: "请填写有效邮箱",
  invalidPhone: "请填写有效手机号",
  selectChannelFirst: "请选择支付方式",
  usdReference: "标价",
  cnyRateHint: "USD→CNY 汇率",
  cnyRateMissing: "微信/支付宝需在后台配置 USD→CNY 汇率，请联系客服。",
  back: "返回",
  backHome: "返回首页",
  loading: "加载中…",
  cancel: "取消返回",
  lookupTitle: "查询订单",
  lookupSubtitle: "用下单时的邮箱或手机号查询",
  lookupQuery: "查询",
  lookupNeedOne: "请输入下单时填写的邮箱或手机号",
  lookupNotFound: "未找到相关订单",
  accountTitle: "我的",
  accountSubtitle: "账户与订单",
  loginPrompt: "使用邮箱注册并验证后，可在此查看订单记录。",
  login: "登录",
  register: "注册",
  lookupHint: "未登录？用邮箱查单 →",
  verifiedEmail: "已验证邮箱",
  signOut: "退出登录",
  myOrders: "我的订单",
  noOrders: "暂无订单，去首页选购吧。",
  viewCard: "查看卡密 →",
  myCards: "我的卡密",
  cardDelivery: "您的激活卡",
  keepSafe: "请妥善保管，勿外泄",
  finishPaymentFirst: "请先完成支付流程",
  yourVipCode: "您的卡密",
  order: "订单",
  cardNotAllocated: "该订单尚未分配卡密",
  saveScreenshot: "请勿外泄 · 复制后到 App 内激活",
  copyCode: "复制卡密",
  copied: "已复制",
  tapToCopy: "点击卡密或下方按钮即可复制",
  keepShopping: "继续逛逛",
  cardVerifyTitle: "验证订单",
  cardVerifyHint: "请输入下单时使用的邮箱或手机号，以查看激活码。",
  cardVerifySubmit: "查看卡密",
  cardVerifyMismatch: "验证失败，请检查邮箱或手机号是否正确。",
  cardOrderNotPaid: "订单尚未支付成功，请稍后再试。",
  rateLimitExceeded: "请求过于频繁，请稍后再试。",
  usdtPayTitle: "USDT 支付",
  usdtPaySubtitle: "TRC20 网络 · 金额必须完全一致",
  usdtNotConfigured: "USDT 直连支付尚未配置。",
  usdtNetwork: "USDT · TRC20",
  usdtSendExactly: "请转入以下精确金额",
  usdtDecimalWarning:
    "金额必须完全一致，含小数点后 6 位（如 12.037412）。四舍五入、只转整数或 12.04 等均无法自动发卡。",
  usdtWalletAddress: "收款地址（TRC20）",
  usdtWaiting: "等待链上到账…",
  usdtWaitingHint: "确认到账后自动发卡（通常 1–3 分钟）。",
  usdtExpired: "支付已超时",
  usdtExpiredHint: "请重新下单，请勿再向该金额转账。",
  usdtImportant: "注意事项",
  usdtImportantHint:
    "务必选择 TRC20 网络。建议点击上方金额一键复制，原样粘贴到钱包，勿改小数位。网络或金额错误将无法自动发卡，请联系客服并提供交易哈希。",
};

const dictionaries: Record<Locale, Dict> = { en, zh };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}
