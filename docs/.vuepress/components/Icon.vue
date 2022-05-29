<template>
  <svg class="svg-icon" :style="extraStyle" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
export default {
  name: "Icon",
  props: {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
    },
    size: {
      type: String,
      validator(val) {
        const validVals = ["large", "normal", "mini"];
        return validVals.includes(val);
      }
    }
  },
  computed: {
    iconName() {
      return `#icon-${this.name}`;
    },

    extraStyle() {
      const { color, size } = this;
      const sizeMapper = {
        large: "20px",
        normal: "16px",
        mini: "12px",
      };
      const output = {};
      if (size && sizeMapper[size]) {
        output.width = sizeMapper[size];
        output.height = sizeMapper[size];
      }
      if (color) {
        output.color = color;
      }
      return output;
    },
  },
};
</script>

<style>
.svg-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  overflow: hidden;
  vertical-align: text-bottom;
}
</style>
