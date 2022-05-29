var buildIndexTree = require('./buildIndexTree')
var fs = require('fs')

const indexTree = buildIndexTree()

// const DOWNLOAD_FILES = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', '7z', '7zip', 'zip', 'rar', 'pdf']
const DOWNLOAD_FILES = /\.(doc|docx|xls|xlsx|ppt|pptx|7z|7zip|zip|rar|pdf)/
const IMAGE_FILES = /\.(png|jpg|jpeg|svg)$/

const renderIcon = (name) => {
  let fileIcon = getIconName(name)
  return `<i class="${fileIcon}"></i>`
}

const getIconName = (name) => {
  let fileIcon = 'fa fa-file'
  if (/\.(ppt|pptx)$/.test(name))
    fileIcon = 'fa fa-file-powerpoint-o'
  if (/\.(doc|docx)$/.test(name))
    fileIcon = 'fa fa-file-word-o'
  if (/\.(xls|xlsx)$/.test(name))
    fileIcon = 'fa fa-file-excel-o'
  if (IMAGE_FILES.test(name))
    fileIcon = 'fa fa-file-image-o'
  if (/\.(7z|7zip|zip|rar)$/.test(name))
    fileIcon = 'fa fa-file-archive-o'
  if (/\.index\.html$/.test(name))
    fileIcon = 'fa fa-file-code-o'
  if (/\.pdf$/.test(name))
    fileIcon = 'fa fa-file-pdf-o'
  return fileIcon
}

const renderDetails = (tree) => {
  return Object.entries(tree)
    .sort((a, b) => a[0] < b[0])
    .map(([name, info]) =>
      IMAGE_FILES.test(name) || /index\.html$/.test(name) || DOWNLOAD_FILES.test(name)
        ? `<a href="${info.webUri}" title="${info.name}" target="iframe_content">${renderIcon(info.name)}${info.name}</a>`
        : `
        <details open>
          <summary title="${name}">
            <h2>${name}</h2>
          </summary>
          <ul>
            <li>${renderChildren(name, info)}</li>
          </ul>
        </details>
      `).join('')
}

const renderChildren = (name, info) => {
  if (info.children && Object.keys(info.children).length > 0) {
    return renderDetails(info.children);
  } else {
    return `
      <a href="${info.webUri}" title="${info.name}" target="iframe_content">${renderIcon(info.name)}${info.name}</a>
    `
  }
}

const html = renderDetails({
  '项目原型目录': {
    name: '项目原型目录',
    children: indexTree,
  },
});

const result = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="zh_CN">

<head>
  <title>产品原型和设计文档</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <link rel="stylesheet" href="https://unpkg.com/font-awesome@4.7.0/css/font-awesome.min.css" defer>
  <link href="style.css" rel="stylesheet">
</head>

<body class="hashover">
  <div id="outerContainer">
    <div class="left-side" tab-index="0">
      ${html}
    </div>
    <div class="right-content">
      <iframe name="iframe_content">
      请选择左侧页面
      </iframe>
    </div>
  </div>
</body>
</html>
`;

console.log('result:', result)
fs.writeFile('./index.html', result, function (error) {
  if (error) {
    console.log('写入失败')
  } else {
    console.log('写入成功了')
  }
})

console.log(html);
