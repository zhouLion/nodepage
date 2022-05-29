<template>
	<div class="docx-grid">
		{{ errorMsg }}

		<skeleton class="mx-4" v-if="onLoading" :lines="20"></skeleton>

		<section class="docx-content">
			<div ref="Grid"></div>
		</section>
	</div>
</template>

<script>
import skeleton from "./Skeleton";
import { previewDoc } from "@/utils/docx";

export default {
	name: "DocxGrid",
	data() {
		return {
			errorMsg: "",
			onLoading: false,
		};
	},

	components: {
		skeleton,
	},

	props: {
		src: {
			required: true,
			type: String
		}
	},

	watch: {
		src: {
			handler() {
				this.fetchDocxFile();
			}
		}
	},

	mounted() {
		this.initGrid();
		this.fetchDocxFile();
	},

	beforeDestroy() {
		if (this.__resize) {
			window.removeEventListener("resize", this.__resize);
			this.__resize = null;
		}
	},

	methods: {
		initGrid() {
			this.__resize = () => {
				const _grid = this.$refs.Grid;
				_grid.style.height = window.innerHeight + "px";
				_grid.style.width = window.innerWidth + "px";
			};
			this.__resize();
			window.addEventListener("resize", this.__resize);
		},

		fetchDocxFile() {
			this.onLoading = true;
			const fileLink = this.src;
			fetch(fileLink)
				.then(res => {
					return res.blob();
				})
				.then((blob) => {
          previewDoc(blob, this.$refs.Grid);
				})
				.catch((error) => {
					this.errorMsg = error.message;
				})
				.finally(() => {
					this.onLoading = false;
				});
		},
	}
};
</script>

<style lang="less" scoped>
	.docx-grid {
		position: relative;
		overflow: auto;
		width: 100%;
		height: auto;
	}
</style>
