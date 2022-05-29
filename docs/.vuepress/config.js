module.exports = (ctx) => {
  return {
    base: "/pages/medical_frontend_project/frontend-docs-online/",
    head: [
      ["link", { rel: "icon", href: `/pic-moren.png` }],
      ["script", { src: "/jszip/index.min.js" }],
      ["script", { src: "/xlsx/index.min.js" }],
      ["script", { src: "/xlsx/grid.min.js" }],
      ["script", { src: "/xlsx/xlsx.full.min.js" }],
    ],
    locales: {
      "/": {
        lang: "zh-CN", // 将会被设置为 <html> 的 lang 属性
        title: "在线文档系统的文档",
      },
    },
    themeConfig: {
      sidebar: "auto",
      editLinks: true,
      // docsDir: 'packages/docs/docs',
      smoothScroll: true,
      nav: [
        { text: "了解一下", link: "/guide/" },
        {
          text: "原型发布指南",
          items: [
            {
              text: "我是使用 windows 标机",
              link: "/for-product-win",
            },
            {
              text: "我是使用 mac 标机",
              link: "/for-product-mac",
            },
          ],
        },
        {
          text: "源码",
          link: "",
        },
      ],
    },
  };
};
