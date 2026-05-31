import type { Locale } from "./config";

export type AdminDict = {
  // language switcher
  langEn: string;
  langZh: string;

  // common
  backToAdmin: string;
  save: string;
  saving: string;
  delete: string;
  deleting: string;
  add: string;
  adding: string;
  creating: string;
  import: string;
  importing: string;
  pending: string;
  hideFromStore: string;
  showOnStore: string;
  active: string;
  hidden: string;
  inactive: string;
  enabled: string;
  external: string;
  internal: string;
  noCategory: string;
  noCardType: string;
  nameEn: string;
  nameZh: string;
  nameZhShort: string;
  labelEn: string;
  labelZh: string;
  questionEn: string;
  questionZh: string;
  answerEn: string;
  answerZh: string;
  sortOrder: string;
  loadFailed: string;
  empty: string;

  // home dashboard
  adminTitle: string;
  adminSubtitle: string;
  signOut: string;
  navProducts: string;
  navProductsDesc: string;
  navCategories: string;
  navCategoriesDesc: string;
  navPlatforms: string;
  navPlatformsDesc: string;
  navLinks: string;
  navLinksDesc: string;
  navAds: string;
  navAdsDesc: string;
  navHomepage: string;
  navHomepageDesc: string;
  navFaqs: string;
  navFaqsDesc: string;
  navPayments: string;
  navPaymentsDesc: string;
  navOrders: string;
  navOrdersDesc: string;
  navCustomers: string;
  navCustomersDesc: string;
  navCards: string;
  navCardsDesc: string;
  navUsers: string;
  navUsersDesc: string;
  navSettings: string;
  navSettingsDesc: string;

  // login
  loginEyebrow: string;
  loginTitle: string;
  loginDesc: string;
  loginEmail: string;
  loginPassword: string;
  loginSubmit: string;
  loginNotAdmin: string;
  loginFailed: string;

  // card types
  cardTypeMonthly: string;
  cardTypeQuarterly: string;
  cardTypeAnnual: string;
  cardTypeTrial: string;
  selectPlatform: string;
  selectCardType: string;

  // products
  productsTitle: string;
  createProduct: string;
  createProductBtn: string;
  priceUsd: string;
  coverUrlOptional: string;
  coverUrl: string;
  uploadCover: string;
  replaceCover: string;
  descEn: string;
  descZh: string;
  confirmDeleteProduct: string;

  // categories
  categoriesTitle: string;
  categoriesSubtitle: string;
  addCategory: string;
  newCategory: string;
  slugOptional: string;
  iconUrl: string;
  confirmDeleteCategory: string;

  // platforms
  platformsTitle: string;
  platformsSubtitle: string;
  addPlatform: string;
  newPlatform: string;
  logoUrl: string;
  uploadLogo: string;
  replaceLogo: string;
  androidUrl: string;
  iosUrl: string;
  cloudUrl: string;
  detailPageUrl: string;
  confirmDeletePlatform: string;

  // links
  linksTitle: string;
  linksSubtitle: string;
  linksPromoHint: string;
  addLink: string;
  newLink: string;
  urlOrPath: string;
  externalLink: string;
  confirmDeleteLink: string;

  // ads
  adsTitle: string;
  adsSubtitle: string;
  addAd: string;
  newAd: string;
  adTextEn: string;
  adTextZh: string;
  adLinkOptional: string;
  adLinkOptionalShort: string;
  adTextZhShort: string;
  confirmDeleteAd: string;

  // homepage
  homepageTitle: string;
  homepageSubtitle: string;
  saveContent: string;
  headerTagline: string;
  taglineEnPh: string;
  taglineZhPh: string;
  showVipHero: string;
  heroEyebrow: string;
  heroEyebrowEnPh: string;
  heroEyebrowZhPh: string;
  heroTitle: string;
  heroTitleEnPh: string;
  heroTitleZhPh: string;
  heroDesc: string;
  heroDescEnPh: string;
  heroDescZhPh: string;

  // faqs
  faqsTitle: string;
  faqsSubtitle: string;
  addFaq: string;
  newFaq: string;
  confirmDeleteFaq: string;

  // payments
  paymentsTitle: string;
  paymentsSubtitle: string;

  // orders
  ordersTitle: string;
  filterAll: string;
  filterPaid: string;
  filterPending: string;
  filterCancelled: string;
  orderId: string;
  product: string;
  status: string;

  // customers
  customersTitle: string;
  customersSubtitle: string;
  statEmail: string;
  statPhone: string;
  exportCsv: string;
  ordersCount: string;

  // cards
  cardsTitle: string;
  statTotal: string;
  statAvailable: string;
  statUsed: string;
  clearInventory: string;
  clearInventoryHint: string;
  clearUsed: string;
  clearAvailable: string;
  clearAll: string;
  confirmClearUsed: string;
  confirmClearAvailable: string;
  confirmClearAll: string;
  bulkImport: string;
  bulkImportHint: string;
  importCards: string;
  pasteCodesPh: string;
  addSingleCard: string;
  cardCodeUnique: string;
  addCardBtn: string;
  confirmDeleteCard: string;
  statusUsed: string;
  statusAvailable: string;
  noCards: string;

  // users
  usersTitle: string;
  joined: string;
  noUsers: string;

  // settings
  settingsTitle: string;
  settingsSubtitle: string;
  saveSettings: string;
  enabledLanguages: string;
  enableEnglish: string;
  enableChinese: string;
  defaultLanguage: string;
  tawkTitle: string;
  tawkPh: string;
  tawkHint: string;
  fallbackChat: string;
  fallbackChatPh: string;
  fallbackChatHint: string;
  whatsappTitle: string;
  whatsappPh: string;
  whatsappHint: string;
};

const en: AdminDict = {
  langEn: "EN",
  langZh: "中文",

  backToAdmin: "← Back to admin",
  save: "Save",
  saving: "Saving…",
  delete: "Delete",
  deleting: "Deleting…",
  add: "Add",
  adding: "Adding…",
  creating: "Creating…",
  import: "Import",
  importing: "Importing…",
  pending: "…",
  hideFromStore: "Hide from store",
  showOnStore: "Show on store",
  active: "Active",
  hidden: "Hidden",
  inactive: "Inactive",
  enabled: "Enabled",
  external: "external",
  internal: "internal",
  noCategory: "— No category —",
  noCardType: "— Card type —",
  nameEn: "Name (EN) *",
  nameZh: "Name (中文)",
  nameZhShort: "中文名",
  labelEn: "Label (EN) *",
  labelZh: "Label (中文)",
  questionEn: "Question (EN) *",
  questionZh: "Question (中文)",
  answerEn: "Answer (EN) *",
  answerZh: "Answer (中文)",
  sortOrder: "Sort order",
  loadFailed: "Failed to load",
  empty: "No items found.",

  adminTitle: "Admin",
  adminSubtitle: "admin.vkeyshop.co",
  signOut: "Sign out",
  navProducts: "Products",
  navProductsDesc: "Create / edit / delete / visibility",
  navCategories: "Categories",
  navCategoriesDesc: "Storefront sections / sort / icons",
  navPlatforms: "Downloads",
  navPlatformsDesc: "App download links per platform",
  navLinks: "Quick Links",
  navLinksDesc: "Top buttons on home / sort / visibility",
  navAds: "Scrolling Ads",
  navAdsDesc: "Home marquee / add edit delete hide",
  navHomepage: "Homepage Copy",
  navHomepageDesc: "Tagline / VIP banner text",
  navFaqs: "FAQ",
  navFaqsDesc: "Q&A content / sort / visibility",
  navPayments: "Payments",
  navPaymentsDesc: "Cryptomus / NOWPayments / Stripe / PayPal",
  navOrders: "Orders",
  navOrdersDesc: "Payment & card delivery status",
  navCustomers: "Customers",
  navCustomersDesc: "Sales data / export for campaigns",
  navCards: "Card Inventory",
  navCardsDesc: "Import & stock statistics",
  navUsers: "Users",
  navUsersDesc: "Registered user list",
  navSettings: "Settings",
  navSettingsDesc: "Languages / support / WhatsApp",

  loginEyebrow: "Staff Only",
  loginTitle: "Admin Login",
  loginDesc: "Hidden from the storefront. Authorized email required.",
  loginEmail: "Admin email",
  loginPassword: "Password",
  loginSubmit: "Sign in",
  loginNotAdmin: "This email has no admin access.",
  loginFailed: "Login failed. Check email and password.",

  cardTypeMonthly: "Monthly",
  cardTypeQuarterly: "Quarterly",
  cardTypeAnnual: "Annual",
  cardTypeTrial: "Trial",
  selectPlatform: "Select platform",
  selectCardType: "Select card type",

  productsTitle: "Product Management",
  createProduct: "Create product",
  createProductBtn: "Create Product",
  priceUsd: "Price (USD)",
  coverUrlOptional: "Cover URL (optional)",
  coverUrl: "Cover URL",
  uploadCover: "Or upload cover image",
  replaceCover: "Replace cover (upload)",
  descEn: "Description (EN)",
  descZh: "Description (中文)",
  confirmDeleteProduct: "Delete this product? This cannot be undone.",

  categoriesTitle: "Categories",
  categoriesSubtitle: "Storefront sections / box brands",
  addCategory: "Add category",
  newCategory: "New category",
  slugOptional: "slug (optional)",
  iconUrl: "Icon URL",
  confirmDeleteCategory: "Delete this category? This cannot be undone.",

  platformsTitle: "Platform Downloads",
  platformsSubtitle: "Per-app download links",
  addPlatform: "Add platform",
  newPlatform: "New platform",
  logoUrl: "Logo URL",
  uploadLogo: "Or upload logo",
  replaceLogo: "Replace logo (upload)",
  androidUrl: "Android URL",
  iosUrl: "iOS URL",
  cloudUrl: "Cloud / backup URL",
  detailPageUrl: "Detail page URL",
  confirmDeletePlatform: "Delete this platform? This cannot be undone.",

  linksTitle: "Quick Links",
  linksSubtitle: "Top buttons on the storefront home",
  linksPromoHint:
    "Rows labeled [Promo] are for broadcast only — keep them Hidden. Broadcast links: keylounge.net/vip, /card, etc. URL field = main-site destination (vkeyshop.co) with UTM tags.",
  addLink: "Add link",
  newLink: "New link",
  urlOrPath: "URL or path (e.g. /faq or https://…) *",
  externalLink: "External link (open in new tab)",
  confirmDeleteLink: "Delete this link? This cannot be undone.",

  adsTitle: "Scrolling Ads",
  adsSubtitle:
    "Right-to-left marquee on the home page. Optional link (e.g. /support).",
  addAd: "Add ad",
  newAd: "New ad",
  adTextEn: "Ad text (EN) *",
  adTextZh: "Ad text (中文)",
  adLinkOptional: "Link (optional, e.g. /support)",
  adLinkOptionalShort: "Link (optional)",
  adTextZhShort: "中文文案",
  confirmDeleteAd: "Delete this ad? This cannot be undone.",

  homepageTitle: "Homepage Content",
  homepageSubtitle:
    "Header tagline and VIP hero banner. Leave blank to use defaults.",
  saveContent: "Save content",
  headerTagline: "Header tagline",
  taglineEnPh: "Tagline (EN) — e.g. Private activation · Instant delivery",
  taglineZhPh: "Tagline (中文)",
  showVipHero: "Show VIP hero banner",
  heroEyebrow: "Hero — eyebrow (small label)",
  heroEyebrowEnPh: "EN — e.g. Members Only",
  heroEyebrowZhPh: "中文 — e.g. 会员专区",
  heroTitle: "Hero — title",
  heroTitleEnPh: "EN — e.g. VIP Activation Cards",
  heroTitleZhPh: "中文 — e.g. VIP 激活卡专区",
  heroDesc: "Hero — description",
  heroDescEnPh: "EN — e.g. Instant delivery · 24/7",
  heroDescZhPh: "中文 — e.g. 付款后即时发卡",

  faqsTitle: "FAQ",
  faqsSubtitle: "Shown on the storefront /faq page",
  addFaq: "Add FAQ",
  newFaq: "New FAQ",
  confirmDeleteFaq: "Delete this FAQ? This cannot be undone.",

  paymentsTitle: "Payment Channels",
  paymentsSubtitle: "Only enabled channels appear at checkout.",

  ordersTitle: "Order Management",
  filterAll: "All",
  filterPaid: "Paid",
  filterPending: "Pending",
  filterCancelled: "Cancelled",
  orderId: "Order ID",
  product: "Product",
  status: "Status",

  customersTitle: "Customers",
  customersSubtitle: "Built from paid orders. Use for mass campaigns.",
  statEmail: "Email",
  statPhone: "Phone",
  exportCsv: "Export CSV",
  ordersCount: "orders",

  cardsTitle: "Card Inventory",
  statTotal: "Total",
  statAvailable: "Available",
  statUsed: "Used",
  clearInventory: "Clear inventory",
  clearInventoryHint: "Remove old / test cards. Counts update automatically.",
  clearUsed: "Clear used",
  clearAvailable: "Clear available",
  clearAll: "Clear ALL",
  confirmClearUsed: "Delete ALL used cards? This cannot be undone.",
  confirmClearAvailable: "Delete ALL available cards? This cannot be undone.",
  confirmClearAll: "Delete EVERY card in inventory? This cannot be undone.",
  bulkImport: "Bulk import",
  bulkImportHint:
    "Upload a .txt file or paste codes — one per line. Duplicates are skipped.",
  importCards: "Import cards",
  pasteCodesPh: "Or paste codes here, one per line\nWZT064FC431E1BFF624B83C\n...",
  addSingleCard: "Add single card",
  cardCodeUnique: "Card code (unique)",
  addCardBtn: "Add Card",
  confirmDeleteCard: "Delete this card? This cannot be undone.",
  statusUsed: "Used",
  statusAvailable: "Available",
  noCards: "No card inventory found.",

  usersTitle: "User Management",
  joined: "Joined",
  noUsers: "No users found.",

  settingsTitle: "Site Settings",
  settingsSubtitle: "Storefront languages & support",
  saveSettings: "Save settings",
  enabledLanguages: "Enabled languages",
  enableEnglish: "English",
  enableChinese: "中文 (uncheck to hide on storefront after launch)",
  defaultLanguage: "Default language",
  tawkTitle: "Tawk.to live chat (recommended)",
  tawkPh: "https://embed.tawk.to/<propertyId>/<widgetId>",
  tawkHint:
    "Paste the Widget embed URL from Tawk.to. When set, Support opens live chat.",
  fallbackChat: "Fallback chat link (optional)",
  fallbackChatPh: "https://t.me/… / https://wa.me/… / QQ link",
  fallbackChatHint: "Used only when Tawk.to above is empty.",
  whatsappTitle: "WhatsApp button (optional)",
  whatsappPh: "https://wa.me/447700900000?text=Hi",
  whatsappHint:
    "Format: https://wa.me/<country code+number, no + or spaces>. Works alongside Tawk.to.",
};

const zh: AdminDict = {
  langEn: "EN",
  langZh: "中文",

  backToAdmin: "← 返回后台",
  save: "保存",
  saving: "保存中…",
  delete: "删除",
  deleting: "删除中…",
  add: "添加",
  adding: "添加中…",
  creating: "创建中…",
  import: "导入",
  importing: "导入中…",
  pending: "…",
  hideFromStore: "主站隐藏",
  showOnStore: "主站显示",
  active: "已上架",
  hidden: "已隐藏",
  inactive: "已下架",
  enabled: "已启用",
  external: "外链",
  internal: "站内",
  noCategory: "— 不选分类 —",
  noCardType: "— 卡片类型 —",
  nameEn: "英文名称 *",
  nameZh: "中文名称",
  nameZhShort: "中文名",
  labelEn: "英文标签 *",
  labelZh: "中文标签",
  questionEn: "英文问题 *",
  questionZh: "中文问题",
  answerEn: "英文答案 *",
  answerZh: "中文答案",
  sortOrder: "排序",
  loadFailed: "加载失败",
  empty: "暂无数据。",

  adminTitle: "后台管理",
  adminSubtitle: "admin.vkeyshop.co 独立入口",
  signOut: "退出",
  navProducts: "商品管理",
  navProductsDesc: "新建 / 编辑 / 删除 / 上下架",
  navCategories: "分类管理",
  navCategoriesDesc: "主站板块 / 排序 / 图标",
  navPlatforms: "平台下载",
  navPlatformsDesc: "各直播软件下载地址",
  navLinks: "快捷按钮",
  navLinksDesc: "主站顶部按钮 / 排序 / 显隐",
  navAds: "滚动广告",
  navAdsDesc: "首页跑马灯 / 添加编辑删除显隐",
  navHomepage: "首页文案",
  navHomepageDesc: "标语 / VIP 横幅文案",
  navFaqs: "常见问题",
  navFaqsDesc: "问答内容 / 排序 / 显隐",
  navPayments: "支付通道",
  navPaymentsDesc: "Cryptomus / NOWPayments / Stripe / PayPal",
  navOrders: "订单管理",
  navOrdersDesc: "查看支付与发卡状态",
  navCustomers: "客户档案",
  navCustomersDesc: "销售数据 / 群发导出",
  navCards: "卡密库存",
  navCardsDesc: "导入与库存统计",
  navUsers: "用户管理",
  navUsersDesc: "注册用户列表",
  navSettings: "站点设置",
  navSettingsDesc: "语言 / 客服 / WhatsApp",

  loginEyebrow: "仅限管理员",
  loginTitle: "后台登录",
  loginDesc: "此入口不在主站展示，仅管理员使用。需使用已授权邮箱登录。",
  loginEmail: "管理员邮箱",
  loginPassword: "密码",
  loginSubmit: "进入后台",
  loginNotAdmin: "该邮箱无后台权限。",
  loginFailed: "登录失败，请检查账号密码。",

  cardTypeMonthly: "月卡",
  cardTypeQuarterly: "季卡",
  cardTypeAnnual: "年卡",
  cardTypeTrial: "体验卡",
  selectPlatform: "选择平台",
  selectCardType: "选择卡片类型",

  productsTitle: "商品管理",
  createProduct: "新建商品",
  createProductBtn: "创建商品",
  priceUsd: "价格 (USD)",
  coverUrlOptional: "封面图 URL（可选）",
  coverUrl: "封面图 URL",
  uploadCover: "或上传封面图",
  replaceCover: "更换封面图（上传）",
  descEn: "英文描述",
  descZh: "中文描述",
  confirmDeleteProduct: "确定删除此商品？此操作不可撤销。",

  categoriesTitle: "分类管理",
  categoriesSubtitle: "主站板块 / 盒子品牌",
  addCategory: "添加分类",
  newCategory: "新建分类",
  slugOptional: "slug（可选）",
  iconUrl: "图标 URL",
  confirmDeleteCategory: "确定删除此分类？此操作不可撤销。",

  platformsTitle: "平台下载",
  platformsSubtitle: "各 App 下载链接",
  addPlatform: "添加平台",
  newPlatform: "新建平台",
  logoUrl: "Logo URL",
  uploadLogo: "或上传 Logo",
  replaceLogo: "更换 Logo（上传）",
  androidUrl: "Android 下载地址",
  iosUrl: "iOS 下载地址",
  cloudUrl: "网盘 / 备用地址",
  detailPageUrl: "详情页 URL",
  confirmDeletePlatform: "确定删除此平台？此操作不可撤销。",

  linksTitle: "快捷按钮",
  linksSubtitle: "主站首页顶部按钮",
  linksPromoHint:
    "带 [Promo] 前缀的条目仅供群发参考——请保持「隐藏」。群发链接：keylounge.net/vip、/card 等；URL 字段为主站 vkeyshop.co 跳转地址（含 UTM）。",
  addLink: "添加按钮",
  newLink: "新建按钮",
  urlOrPath: "URL 或路径（如 /faq 或 https://…）*",
  externalLink: "外链（新标签页打开）",
  confirmDeleteLink: "确定删除此按钮？此操作不可撤销。",

  adsTitle: "滚动广告",
  adsSubtitle: "首页从右往左跑马灯。可选跳转链接（如 /support）。",
  addAd: "添加广告",
  newAd: "新建广告",
  adTextEn: "广告文案（英文）*",
  adTextZh: "广告文案（中文）",
  adLinkOptional: "跳转链接（可选，如 /support）",
  adLinkOptionalShort: "跳转链接（可选）",
  adTextZhShort: "中文文案",
  confirmDeleteAd: "确定删除此广告？此操作不可撤销。",

  homepageTitle: "首页文案",
  homepageSubtitle: "页头标语与 VIP 横幅。留空则使用内置默认值。",
  saveContent: "保存文案",
  headerTagline: "页头标语",
  taglineEnPh: "英文标语 — 例：Instant delivery · Private activation",
  taglineZhPh: "中文标语",
  showVipHero: "显示 VIP 横幅",
  heroEyebrow: "横幅 — 小标签",
  heroEyebrowEnPh: "英文 — 例：Members Only",
  heroEyebrowZhPh: "中文 — 例：会员专区",
  heroTitle: "横幅 — 标题",
  heroTitleEnPh: "英文 — 例：VIP Activation Cards",
  heroTitleZhPh: "中文 — 例：VIP 激活卡专区",
  heroDesc: "横幅 — 描述",
  heroDescEnPh: "英文 — 例：Instant delivery · 24/7",
  heroDescZhPh: "中文 — 例：付款后即时发卡",

  faqsTitle: "常见问题",
  faqsSubtitle: "显示在主站 /faq 页面",
  addFaq: "添加问答",
  newFaq: "新建问答",
  confirmDeleteFaq: "确定删除此问答？此操作不可撤销。",

  paymentsTitle: "支付通道",
  paymentsSubtitle: "仅启用的通道会在结算页显示。",

  ordersTitle: "订单管理",
  filterAll: "全部",
  filterPaid: "已支付",
  filterPending: "待支付",
  filterCancelled: "已取消",
  orderId: "订单号",
  product: "商品",
  status: "状态",

  customersTitle: "客户档案",
  customersSubtitle: "来自已支付订单，可用于群发营销。",
  statEmail: "邮箱",
  statPhone: "手机",
  exportCsv: "导出 CSV",
  ordersCount: "笔订单",

  cardsTitle: "卡密库存",
  statTotal: "全部",
  statAvailable: "可用",
  statUsed: "已用",
  clearInventory: "清空库存",
  clearInventoryHint: "删除测试/旧卡密。上方统计会自动更新。",
  clearUsed: "清空已用",
  clearAvailable: "清空可用",
  clearAll: "全部清空",
  confirmClearUsed: "确定删除所有已用卡密？此操作不可撤销。",
  confirmClearAvailable: "确定删除所有可用卡密？此操作不可撤销。",
  confirmClearAll: "确定清空全部卡密？此操作不可撤销。",
  bulkImport: "批量导入",
  bulkImportHint: "上传 .txt 或粘贴卡密，每行一条。重复会自动跳过。",
  importCards: "导入卡密",
  pasteCodesPh: "或在此粘贴，每行一条\nWZT064FC431E1BFF624B83C\n...",
  addSingleCard: "添加单张卡密",
  cardCodeUnique: "卡密（唯一）",
  addCardBtn: "添加卡密",
  confirmDeleteCard: "确定删除此卡密？此操作不可撤销。",
  statusUsed: "已使用",
  statusAvailable: "可用",
  noCards: "暂无卡密库存。",

  usersTitle: "用户管理",
  joined: "注册时间",
  noUsers: "暂无用户。",

  settingsTitle: "站点设置",
  settingsSubtitle: "主站语言与在线客服",
  saveSettings: "保存设置",
  enabledLanguages: "启用的语言",
  enableEnglish: "English",
  enableChinese: "中文（上线后可取消勾选以隐藏中文）",
  defaultLanguage: "默认语言",
  tawkTitle: "Tawk.to 在线客服（推荐）",
  tawkPh: "https://embed.tawk.to/<propertyId>/<widgetId>",
  tawkHint: "粘贴 Tawk.to 挂件嵌入地址。设置后「在线客服」可打开网页聊天。",
  fallbackChat: "备用客服链接（可选）",
  fallbackChatPh: "https://t.me/… / https://wa.me/… / QQ 链接",
  fallbackChatHint: "仅当上方 Tawk.to 为空时使用。",
  whatsappTitle: "WhatsApp 按钮（可选）",
  whatsappPh: "https://wa.me/447700900000?text=Hi",
  whatsappHint:
    "格式：https://wa.me/国家码+号码（无 + 和空格）。可与 Tawk.to 同时使用。",
};

const dictionaries: Record<Locale, AdminDict> = { en, zh };

export function getAdminDictionary(locale: Locale): AdminDict {
  return dictionaries[locale];
}

/** Localized card-type options for admin selects. */
export function getAdminCardTypes(t: AdminDict) {
  return [
    { value: "monthly", label: t.cardTypeMonthly },
    { value: "quarterly", label: t.cardTypeQuarterly },
    { value: "annual", label: t.cardTypeAnnual },
    { value: "trial", label: t.cardTypeTrial },
  ] as const;
}
