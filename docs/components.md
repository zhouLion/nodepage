# 前端组件

## doc 文档预览

<ClientOnly>
  <DocxGrid src="/sources/git-guide.docx"/>
</ClientOnly>

``` vue
<template>
  <docx-grid src="/sources/git-guide.docx"></docx-grid>
</template>
<script>
import DocxGrid from "@/components/DcoxGrid";
export default {
  components: {
    DocxGrid,
  }
}
</script>
```

## excel 文档预览

<ClientOnly>
  <XlsxGrid src="/sources/git-guide.docx"/>
</ClientOnly>

``` vue
<template>
  <xlsx-grid src="/sources/git-apply.xlsx"></xlsx-grid>
</template>
<script>
import XlsxGrid from "@/components/XlsxGrid";
export default {
  components: {
    XlsxGrid,
  }
}
</script>
```

## 列表骨架
