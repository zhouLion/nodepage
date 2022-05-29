<template>
  <div>
    <xlsx-grid v-if="isExcel" :src="$route.query.src" />
    <docx-grid v-if="isWord" :src="$route.query.src" />
  </div>
</template>

<script>
import XlsxGrid from '@/components/XlsxGrid.vue'
import DocxGrid from '@/components/DocxGrid.vue'

export default {
  name: 'OfficePreview',
  components: {
    XlsxGrid,
    DocxGrid,
  },
  computed: {
    isWord() {
      const { $route } = this
      return !!($route.query.src && $route.query.type === 'word')
    },
    isExcel() {
      const { $route } = this
      return !!($route.query.src && $route.query.type === 'excel')
    },
  },
}
</script>
