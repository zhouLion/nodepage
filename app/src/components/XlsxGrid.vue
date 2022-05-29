<template>
	<div class="xlsx-grid">
		<header class="p-sticky">
			<button
				v-for="sheet in Sheets"
				:key="sheet.id"
				:class="{
					actived: sheet.name === sheetName,
				}"
				@click="toggleSheetName(sheet.name)"
			>
				{{ sheet.name }}
			</button>
		</header>

		{{ errorMsg }}

		<skeleton class="mx-4" v-if="onLoading" :lines="20"></skeleton>

		<section class="xlsx-content">
			<div ref="Grid"></div>
		</section>
	</div>
</template>

<script>
import skeleton from "./Skeleton";

export default {
	name: "XlsxGrid",
	data() {
		return {
			Sheets: [],
			errorMsg: "",
			sheetName: "",
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
				this.fetchXLSXData();
			}
		}
	},

	mounted() {
		this.initCanvasGrid();
		this.fetchXLSXData();
	},

	beforeDestroy() {
		if (this.__resize) {
			window.removeEventListener("resize", this.__resize);
			this.__resize = null;
		}
	},

	methods: {
		initCanvasGrid() {
			this.__resize = () => {
				const _grid = this.$refs.Grid;
				_grid.style.height = window.innerHeight - 40 + "px";
				_grid.style.width = window.innerWidth - 200 + "px";
			};
			this.__resize();
			window.addEventListener("resize", this.__resize);

			this.__cdg = window.canvasDatagrid({
				parentNode: this.$refs.Grid
			});
		},

		fetchXLSXData() {
			this.onLoading = true;
			const fileLink = this.src;
			fetch(fileLink)
				.then(res => {
					return res.arrayBuffer();
				})
				.then(data => {
					this.__workbook = window.XLSX.read(data, { type: "array" });
					this.Sheets = this.__workbook.Workbook.Sheets;
					this.toggleSheetName(this.Sheets[0].name);
				})
				.catch((error) => {
					this.errorMsg = error.message;
				})
				.finally(() => {
					this.onLoading = false;
				});
		},

		toggleSheetName(sheetName) {
			this.sheetName = sheetName;
			if (this.__workbook && this.__cdg) {
				this.__cdg.data = window.XLSX.utils.sheet_to_json(
					this.__workbook.Sheets[sheetName]
				);
			}
		}
	}
};
</script>

<style lang="less" scoped>
	.xlsx-grid {
		position: relative;
		overflow: auto;
		width: 100%;
		height: auto;

		.p-sticky {
			position: sticky;
			top: 0;
			left: 0;
			background: #f0f0f0;
			padding: 4px;
			border: 1px solid #c8c8c8;

			button {
				all: unset;
				border: 1px solid gray;
				margin-right: 4px;
				margin-bottom: 4px;
				padding: 0 12px;
				cursor: pointer;

				&.actived {
					border: 1px solid #0078ff;
					color: #0078ff;
				}
			}
		}
	}
</style>
