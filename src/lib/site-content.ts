/**
 * 餐廳內容唯一真相 — 客戶素材到位後改這一個檔案就好。
 * 各 section 元件直接 `import { siteContent }`,不傳 props。
 */

export type SiteContent = {
  brand: {
    name: string;
    nameEn: string;
    tagline: string;
    logoText: string; // 給未做 logo 前的文字 wordmark 用
  };
  nav: { label: string; href: string }[];
  hero: {
    title: string;
    subtitle: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  about: {
    heading: string;
    paragraphs: string[];
    imageAlt: string;
  };
  specialties: {
    heading: string;
    items: {
      id: string;
      name: string;
      description: string;
      imageAlt: string;
    }[];
  };
  contact: {
    heading: string;
    address: string;
    phone: string; // 顯示字串
    phoneHref: string; // tel:+886...
    hours: { day: string; time: string }[];
    mapEmbedUrl: string; // Google Maps embed src(無需 API key)
    closedNote?: string;
  };
  social: { label: string; href: string }[];
  seo: {
    title: string;
    description: string;
    ogImagePath?: string;
  };
};

export const siteContent: SiteContent = {
  brand: {
    name: "示範餐廳",
    nameEn: "Demo Restaurant",
    tagline: "在地三十年的家常味",
    logoText: "示範",
  },
  nav: [
    { label: "首頁", href: "/#hero" },
    { label: "關於", href: "/#about" },
    { label: "招牌", href: "/#specialties" },
    { label: "菜單", href: "/menu" },
    { label: "聯絡", href: "/#contact" },
  ],
  hero: {
    title: "一道菜,一份心意",
    subtitle: "使用每日新鮮食材,堅持手工現做。",
    primaryCta: { label: "查看菜單", href: "/menu" },
    secondaryCta: { label: "聯絡我們", href: "#contact" },
  },
  about: {
    heading: "關於我們",
    paragraphs: [
      "本店自民國八十三年創立,堅持選用當令食材,從採買到上桌全程把關。",
      "由家族第二代主廚傳承,並融入現代輕食概念,讓每一道家常菜都吃得出新意與心意。",
    ],
    imageAlt: "店內環境照片",
  },
  specialties: {
    heading: "招牌料理",
    items: [
      {
        id: "1",
        name: "招牌紅燒牛肉麵",
        description: "熬煮十二小時的清燉湯頭,選用澳洲牛腱心。",
        imageAlt: "紅燒牛肉麵",
      },
      {
        id: "2",
        name: "古早味滷肉飯",
        description: "三層肉慢火滷製,搭配自製油蔥酥。",
        imageAlt: "滷肉飯",
      },
      {
        id: "3",
        name: "手工蘿蔔糕",
        description: "每日清晨手作,煎至兩面金黃酥脆。",
        imageAlt: "蘿蔔糕",
      },
    ],
  },
  contact: {
    heading: "來店資訊",
    address: "台北市示範區範例路 123 號",
    phone: "02-1234-5678",
    phoneHref: "tel:+886212345678",
    hours: [
      { day: "週二至週日", time: "11:30 - 14:30 / 17:30 - 21:00" },
      { day: "週一", time: "公休" },
    ],
    // 預設指向台北 101 的 embed,客戶提供地址後換掉
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.0367635837407!2d121.5613833!3d25.0338053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442abb6da80a7ad%3A0xacecf4ab92d12d8f!2zVGFpcGVpIDEwMQ!5e0!3m2!1szh-TW!2stw!4v1700000000000",
    closedNote: "農曆春節營業時間另行公告",
  },
  social: [
    { label: "Facebook", href: "https://facebook.com/example" },
    { label: "Instagram", href: "https://instagram.com/example" },
  ],
  seo: {
    title: "示範餐廳 | 在地三十年的家常味",
    description:
      "台北示範區的家常台菜,每日手工現做,招牌紅燒牛肉麵與古早味滷肉飯。",
  },
};
