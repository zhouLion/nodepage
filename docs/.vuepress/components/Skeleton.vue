<template> 
<div class="skeleton active">
  <ul class="skeleton-paragraph">
    <li v-for="l in lines" :key="l" :class="{ 'bold': l === 1 || randomBold() }"></li>
  </ul>
</div>
</template>

<script>
export default {
  name: "Skeleton",
  props: {
    lines: {
      type: Number,
      default: 3,
    }
  },
  methods: {
    randomBold() {
      return Math.random() > 0.8;
    },
  }
};
</script>

<style lang="less">
.skeleton {
  .skeleton-paragraph {
    margin-left: 0;
    padding-left: 0;
  }

  .skeleton-paragraph > li {
    padding-left: 0;
    margin-left: 0;
    width: 100%;
    height: 16px;
    list-style: none;
    background: #f2f2f2;
    margin-bottom: 12px;
  }

  &.active {
    .skeleton-paragraph > li {
      background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
      background-size: 400% 100%;
      animation: skeleton-loading 1.4s ease infinite;
      
      &.bold {
        background: linear-gradient(90deg, #e6e6e6 25%, #cccccc 37%, #e6e6e6 63%);
        background-size: 400% 100%;
        width: 50%;
        height: 18px;
        animation: skeleton-loading 1.4s ease infinite;
      }
    }

  }
}
</style>
