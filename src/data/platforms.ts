/**
 * Reference data collected from vipfkk.com (store) and juhe.live (downloads).
 * Hotlinked URLs for MVP; re-host to your CDN / Supabase Storage for production.
 */

export type BoxApp = {
  slug: string;
  sort: string;
  name: string;
  /** Category tab icon on storefront (vipfkk) */
  categoryLogo: string;
  /** Product card image on storefront (vipfkk) */
  productCover: string;
  /** App icon on download hub (juhe.live) */
  appLogo: string;
  androidUrl: string;
  iosUrl: string;
  cloudUrl: string;
  downloadPage: string;
};

export type StreamingApp = {
  slug: string;
  name: string;
  logo: string;
  androidUrl: string;
  iosUrl: string;
  cloudUrl: string;
  downloadPage: string;
};

export const DOWNLOAD_HUB_PRIMARY = "https://juhe.live";
export const DOWNLOAD_HUB_BACKUP = "http://103.236.57.111:8090";

export const boxApps: BoxApp[] = [
  {
    slug: "wuzei",
    sort: "1",
    name: "乌贼",
    categoryLogo:
      "http://vipfkk.com/content/uploadfile/202512/3d401765464553.png",
    productCover:
      "http://vipfkk.com/content/uploadfile/202512/3d401765465207.png",
    appLogo:
      "https://juhe.live/uploads/images/20250323/ef844533045ddc0523d6c17e4025fe3d.png",
    androidUrl:
      "http://5243.sunmoonweb.com/d/20251220/WZ/Wz0520.apk?sign=xObcDLPMFQVvKv_qed_qZcCPn2o_myYjsbsHdmIPEyA=:0",
    iosUrl:
      "itms-services://?action=download-manifest&url=https://juhe.live/wuzei.plist",
    cloudUrl: "https://wwrp.lanzout.com/b0xvms62d",
    downloadPage: "https://juhe.live/juhezhibo/14.html",
  },
  {
    slug: "dongni",
    sort: "5",
    name: "懂你",
    categoryLogo:
      "http://vipfkk.com/content/uploadfile/202601/3fa11769080520.png",
    productCover:
      "http://vipfkk.com/content/uploadfile/202601/3fa11769080520.png",
    appLogo:
      "https://juhe.live/uploads/images/20260122/10b7c73d912e3b885923f7c80be09d68.png",
    androidUrl:
      "http://5243.sunmoonweb.com/d/20251220/%E6%87%82%E4%BD%A0/dn148.apk?sign=r8jPnvYFce9amKOnxvVg12DYshmkroC6fzv-FXDD7TE=:0",
    iosUrl: "https://wwazw.lanzouu.com/iJJkl3py1wbc",
    cloudUrl: "https://www.dn1.live/?promo_code=111888",
    downloadPage: "https://juhe.live/juhezhibo/18.html",
  },
  {
    slug: "baoyu",
    sort: "2",
    name: "鲍鱼",
    categoryLogo:
      "http://vipfkk.com/content/uploadfile/202512/af8c1765465348.png",
    productCover:
      "http://vipfkk.com/content/uploadfile/202512/af8c1765465348.png",
    appLogo:
      "https://juhe.live/uploads/images/20250323/36254e93efe48762a520dcc18e980ccd.png",
    androidUrl:
      "http://5243.sunmoonweb.com/d/20251220/by/By%E5%AE%89%E5%8D%93%E7%89%885.0.0.apk?sign=EVA6zsimWpVovxa63fbiEZv1MF3QQYwKFsI9Z0nSBGc=:0",
    iosUrl:
      "itms-services://?action=download-manifest&url=https://juhe.live/baoyu.plist",
    cloudUrl: "https://wwbeb.lanzout.com/b0xvbpbkh",
    downloadPage: "https://juhe.live/juhezhibo/12.html",
  },
  {
    slug: "ningmeng",
    sort: "3",
    name: "柠檬",
    categoryLogo:
      "http://vipfkk.com/content/uploadfile/202512/aa591765466150.png",
    productCover:
      "http://vipfkk.com/content/uploadfile/202512/aa591765466150.png",
    appLogo:
      "https://juhe.live/uploads/images/20250323/c3d27bf7eb39753b19fc1cf2dd6c8285.png",
    androidUrl: "https://d2xrad32j31ow0.cloudfront.net/#/?cede=SVELML",
    iosUrl: "",
    cloudUrl: "",
    downloadPage: "https://juhe.live/juhezhibo/13.html",
  },
];

export const streamingApps: StreamingApp[] = [
  {
    slug: "xiaohongmao",
    name: "小红帽直播",
    logo: "https://juhe.live/uploads/images/20250323/b6312ad7076607356f1e317205de4fab.png",
    androidUrl: "https://xhma.club",
    iosUrl: "https://xhma.club",
    cloudUrl: "",
    downloadPage: "https://juhe.live/zhibopingtai/11.html",
  },
  {
    slug: "duocai",
    name: "多彩直播",
    logo: "https://juhe.live/uploads/images/20250323/65e62ed75e2f42aeb4fa67ee470e09a3.png",
    androidUrl: "",
    iosUrl: "",
    cloudUrl: "",
    downloadPage: "https://juhe.live/zhibopingtai/10.html",
  },
  {
    slug: "miyu",
    name: "蜜语直播",
    logo: "https://juhe.live/uploads/images/20250323/fe6f71b2de3d0967203d4745c7d5f778.png",
    androidUrl: "",
    iosUrl: "",
    cloudUrl: "",
    downloadPage: "https://juhe.live/zhibopingtai/9.html",
  },
  {
    slug: "fanqie",
    name: "番茄社区",
    logo: "https://juhe.live/uploads/images/20251224/e935a409c6afe8f3f0e9877bab14190b.png",
    androidUrl: "",
    iosUrl: "",
    cloudUrl: "",
    downloadPage: "https://juhe.live/zhibopingtai/17.html",
  },
];

export function boxAppBySort(sort: string): BoxApp | undefined {
  return boxApps.find((a) => a.sort === sort);
}
