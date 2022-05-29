<template>
  <div class="view-project">
    <section class="container">
      <div
        class="left-side"
        :class="{
          'slide-out': isHiddenLeft,
        }"
      >
        <button class="toggle-btn" @click="toggleLeftSide">
          <i class="el-icon-arrow-right"></i>
        </button>

        <nav>
          <div class="flex-center pointer" @click="goHome">
            <i class="el-icon-s-home"></i>
            <span>在线文档系统<small style="font-size: 12px;">点我刷新</small></span>
          </div>
          <el-popover
            placement="bottom"
            title="查询"
            width="200"
            trigger="click"
          >
            <div>
              <el-input
                v-model="searchWord"
                placeholder="输入关键词"
                size="normal"
                clearable
                @input="onChangeSearchKey"
              ></el-input>
            </div>
            <icon slot="reference" name="ic_search"></icon>
          </el-popover>
        </nav>

        <div v-if="isShowProjectsSelector" class="project-selector">
          <el-select v-model="selectedProject" filterable @change="onChangeProject">
            <el-option
              v-for="item in projectOptions"
              :key="item.projectId"
              :value="item.projectId"
              :label="item.name"
            ></el-option>
          </el-select>
        </div>

        <div class="tabs">
          <div
            class="tab-item"
            :class="{
              actived: activedTab === 'project',
            }"
            @click="activedTab = 'project'"
          >
            产品原型
          </div>
          <div class="divider"></div>
          <div
            class="tab-item"
            :class="{
              actived: activedTab === 'design',
            }"
            @click="activedTab = 'design'"
          >
            视觉设计
          </div>
        </div>

        <div class="tabs-content">
          <skeleton v-if="loading" class="mx-4" :lines="20"></skeleton>
          <template v-else>
            <project-menus
              v-show="activedTab === 'project'"
              v-model="currentPath"
              type="project"
              :menus="projects"
              @click="onClickMenu"
              @preview="onPreview"
            ></project-menus>

            <project-menus
              v-show="activedTab === 'design'"
              v-model="currentPath"
              type="design"
              :menus="designs"
              @click="onClickMenu"
              @preview="onPreview"
              @show-more="showMoreHandler"
            ></project-menus>
          </template>
        </div>
      </div>

      <div class="right-content">
        <div v-if="!currentPath" class="empty">
          <img src="@/assets/pic-moren.png" />
          <span>原型、设计图在线快速查看</span>
        </div>
        <iframe v-else :src="currentPath" frameborder="0"></iframe>
      </div>
    </section>

    <el-dialog
      :fullscreen="isFullScreen"
      :visible.sync="isShowAssetsDialog"
      title="资源文件 - 点击图片可直接下载"
      width="80%"
    >
      <div>
        <el-collapse v-model="activeName">
          <el-collapse-item
            v-for="(asset, index) in assetsFiles"
            :key="asset.extensions"
            :title="`${asset.extensions} - 共 ${asset.files.length} 张`"
            :name="index"
          >
            <ul
              class="gallery-group"
              :class="{
                'is-dark': darkMode,
              }"
            >
              <li v-for="file in asset.files" :key="file" class="gallery-group__item" title="点击下载">
                <a :href="file" download>
                  <img :src="file" class="gallery-group__img" />
                </a>
              </li>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </div>

      <span slot="footer">
        <el-switch
          v-model="isFullScreen"
          class="mx-2"
          :active-value="true"
          :inactive-value="false"
          active-text="全屏"
          inactive-text="缩小"
        >
        </el-switch>

        <el-switch
          v-model="darkMode"
          class="mx-2"
          :active-value="true"
          :inactive-value="false"
          active-text="暗色背景"
          inactive-text="亮色背景"
          @change="changeDarkModeHandler"
        >
        </el-switch>

        <el-button @click="isShowAssetsDialog = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import ProjectMenus from '@/components/ProjectMenus.vue'
import Skeleton from '@/components/Skeleton.vue'
import Icon from '@/components/Icon.vue'

export default Vue.extend({
  name: 'Project',
  components: {
    ProjectMenus,
    Skeleton,
    Icon,
  },
  data() {
    const isHiddenLeft = localStorage.getItem('isHiddenLeft')
    return {
      searchWord: '',
      darkMode: false,
      isShowProjectsSelector: false,
      loading: false,
      loadingIframe: false,
      projects: [],
      designs: [],
      // 激活的tab卡片， 默认proejct，
      activedTab: 'project',
      selectedProject: '',
      currentDesign: '',
      activedItems: [],
      projectOptions: [],
      currentPath: '',
      isHiddenLeft: isHiddenLeft ? JSON.parse(isHiddenLeft) : '',
      designsAndProjectsList: [],
      isFullScreen: false,
      isShowAssetsDialog: false,
      assetsFiles: [],
      activeName: [0],
    }
  },
  computed: {
    documentTitle() {
      try {
        const { designsAndProjectsList, currentPath } = this
        return designsAndProjectsList
          ? designsAndProjectsList
            .find(item => item.path === currentPath)
            .shortPath.join('>')
          : ''
      } catch (error) {
        return ''
      }
    },
  },
  watch: {
    documentTitle(val, preVal) {
      if (val) {
        document.title = `📖在线文档系统>${val}`
      } else {
        document.title = '📖在线文档系统'
      }
    },
  },
  created() {
    document.title = '📖在线文档系统'
    this.fetchDocConfigs()
    this.fetchProjects()
    this.selectedProject = this.$route.params.id
    this.preloadIframe(this.$route.query.redirect)
    if (this.selectedProject) {
      this.fetchMenus(this.selectedProject)
    }
    this.attachSearchEvent()
  },
  methods: {
    changeDarkModeHandler() {

    },
    showMoreHandler(assets) {
      this.assetsFiles = assets.filter(({ files }) => files && files.length > 0)
      this.isShowAssetsDialog = true
    },

    goHome() {
      const { name, path, params } = this.$route
      const resolvedRoute = this.$router.resolve({
        name, path, params,
      })
      window.location.href = resolvedRoute.href
    },

    toggleLeftSide() {
      this.isHiddenLeft = !this.isHiddenLeft
      this.$nextTick(() => {
        localStorage.setItem('isHiddenLeft', this.isHiddenLeft)
      })
    },

    attachSearchEvent() {
      // window.addEventListener("sea")
    },

    onChangeSearchKey() {
      if (this.__timer && this.__isSearch) {
        return
      }
      this.__isSearch = true
      this.__timer = setTimeout(() => {
        this.handlerFilterByFilter()
        window.clearTimeout(this.__timer)
        this.__timer = null
        this.__isSearch = false
      }, 300)
    },

    handlerFilterByFilter() {
      const searchWord = this.searchWord
      const projectFilesFilted = this.projectFileList.filter((fileSet) => {
        return fileSet.path.toLocaleLowerCase().includes(searchWord.toLocaleLowerCase())
      })
      const normalizedData = this.normalizeNestList(projectFilesFilted)
      this.designsAndProjectsList = normalizedData
      this.projects = this.flatToNest(
        normalizedData.filter(d => !d.path.includes('UI')),
      )
      this.designs = this.flatToNest(
        normalizedData.filter(d => d.path.includes('UI')),
      )
    },

    onChangeProject(project) {
      this.$router.replace({
        name: 'project',
        params: {
          id: project,
        },
      })
      this.fetchMenus(project)
    },

    fetchDocConfigs() {
      fetch('/api/doc/configs', {
        method: 'GET',
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          this.isShowProjectsSelector = data.data.isShowProjectsSelector
        })
    },

    fetchProjects() {
      fetch('/api/projects', {
        method: 'GET',
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          this.projectOptions = data.data
        })
    },

    fetchMenus(project) {
      this.loading = true
      fetch(`/api/project/menu-list?projectId=${project}`, {
        method: 'GET',
      })
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          this.projectFileList = data.data
          this.searchWord = ''
          this.handlerFilterByFilter()
        })
        .finally(() => {
          this.loading = false
        })
    },

    flatToNest(data, deep = 0) {
      const uniqRoots = new Set(data.map(item => item.shortPath[deep]))
      const uniqRootList = Array.from(uniqRoots).filter(rootName => !!rootName)
      if (deep === 0) {
        uniqRootList.sort().reverse()
      }
      const result = uniqRootList.map((root) => {
        const subData = data.filter(item => item.shortPath[deep] === root)
        const output = {
          name: root,
        }
        if (subData.length > 1 && deep < 7) {
          output.children = this.flatToNest(subData, deep + 1).filter(
            s => s.name,
          )
        } else if (subData.length === 1) {
          subData[0].path.endsWith('index.html')
            ? Object.assign(output, subData[0], { name: `${root}` })
            : Object.assign(output, subData[0])
        }
        return output
      })
      return result
    },

    normalizeNestList(flattenList) {
      return flattenList.map((item) => {
        let { name, path } = item
        // 简化路径名称，去除前两级的服务节点，剩余的就是文件路径
        const isIndex = name === 'index.html'
        const shortPath = path.split('/')
        shortPath.splice(0, 3)
        if (name === 'index.html') {
          shortPath.pop()
          name = shortPath[shortPath.length - 1]
        }
        return { name, path, shortPath, isIndex }
      })
    },

    onPreview(path) {
      this.onClickMenu({ path })
    },

    onClickMenu(item) {
      if (this.currentPath !== item.path) {
        this.$router.push({
          name: 'project',
          params: this.$route.params,
          query: {
            redirect: item.path,
          },
        })
      }
      this.preloadIframe(item.path)
    },

    preloadIframe(src) {
      this.loadingIframe = true
      return fetch(src)
        .then(res => res.text())
        .then((html) => {
          this.loadingIframe = false
          this.currentPath = src
          return true
        })
    },
  },
})
</script>

<style lang="less">
.mx-2 {
	margin-left: 8px;
	margin-right: 8px;
}
.view-project {
	height: 100vh;
	overflow: hidden;
	position: relative;

	.pointer {
		cursor: pointer;
	}

	.mx-4 {
		margin-left: 16px;
		margin-right: 16px;
	}

	.container {
		display: flex;
		height: 100%;
	}

	.left-side {
		position: relative;
		min-width: 320px;
		height: 100%;
		left: 0;
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: flex-start;
		box-shadow: 6px 0 12px -4px #dddddd;
		transition: left 0.6s ease, opacity 0.2s ease;
		margin-right: 16px;
		background: white;

		&.slide-out {
			position: absolute;
			left: -320px;
			width: 0;
			box-shadow: none;
		}

		nav {
			background: #21283d;
			line-height: 0;
			font-family: PingFangSC-Medium;
			font-size: 20px;
			color: #ffffff;
			padding: 28px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.toggle-btn {
			all: unset;
			position: absolute;
			height: 64px;
			width: 12px;
			right: -14px;
			background-color: white;
			top: calc(50% - 30px);
			border: 1px solid #dddddd;
			border-left: none;
			box-shadow: 3px 0px 12px -5px grey;
			border-radius: 0 12px 12px 0;
			transition: background-color 0.2s ease;
			cursor: pointer;

			.el-icon-arrow-right {
				font-size: 12px;
				transition: all 0.6s ease;
				transform: rotateZ(0);
			}

			&:hover {
				background-color: #0078ff;

				.el-icon-arrow-right {
					color: white;
					font-weight: bold;
					transform: rotateZ(180deg);
				}
			}
		}

		&.slide-out {
			.toggle-btn {
				background-color: #0078ff;

				.el-icon-arrow-right {
					transform: rotateZ(-180deg);
					color: white;
				}

				&:hover {
					.el-icon-arrow-right {
						transform: rotateZ(0);
					}
				}
			}
		}

		.tabs {
			display: flex;
			justify-content: space-around;
			border-bottom: 1px solid #e5e5e5;

			.divider {
				width: 1px;
				background: #e5e5e5;
				position: relative;
				top: 10px;
				height: 18px;
			}

			.tab-item {
				font-family: PingFangSC-Medium;
				font-size: 16px;
				color: #303030;
				padding: 10px;
				cursor: pointer;
				position: relative;

				&:after {
					height: 0;
					width: 0;
					content: "";
					position: absolute;
					background: currentColor;
					bottom: 0;
					left: 10%;
					transition: height 0.2s ease, width 0.2s ease;
				}

				&.actived {
					color: #0078ff;

					&:after {
						transition: height 0.2s ease, width 0.2s ease;
						height: 2px;
						width: 80%;
					}
				}
			}
		}

		.tabs-content {
			flex: 1;
			overflow-y: auto;
			overflow-x: hidden;
			margin-right: 4px;

			&::-webkit-scrollbar {
				z-index: 11;
				width: 6px;
			}
			&::-webkit-scrollbar:horizontal {
				height: 6px;
			}
			&::-webkit-scrollbar-thumb {
				border-radius: 5px;
				width: 6px;
				background: #b4bccc;
			}
			&::-webkit-scrollbar-corner,
			&::-webkit-scrollbar-track {
				background: #fff;
			}
			&::-webkit-scrollbar-track-piece {
				background: #fff;
				width: 6px;
			}
		}
	}

	.project-selector {
		padding: 16px 16px 0 16px;

		.el-select {
			width: 100%;
		}

		.el-select .el-input__inner {
			font-family: PingFangSC-Regular;
			cursor: pointer;
			padding-right: 35px;
			background: #f4f5f7;
			border-radius: 2px;
			height: 48px;
			font-size: 16px;
			color: #333333;
		}
	}

	.right-content {
		width: 100%;

		.empty {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			img {
				width: 108px;
				height: 108px;
			}

			span {
				font-family: PingFangSC-Regular;
				font-size: 16px;
				color: #6b6c70;
			}
		}

		iframe {
			width: 100%;
			height: 100%;
		}
	}
}

ul.gallery-group {
	display: flex;
	flex-wrap: wrap;
	padding: 16px;
	max-height: 300px;
	overflow-y: auto;

	&.is-dark {
		background: #263238;
	}
}

li.gallery-group__item {
	list-style: none;
	margin: 2em;
	border-radius: 4px;
	padding: 1em;
	box-shadow: 4px 4px 20px -8px #9e9e9e;
}

img.gallery-group__img {
	object-fit: contain;
	height: 100px;
	width: 100%;

	&:hover {
		transform: scale(2);
		transition: all .2s ease;
	}
}

.n-progress {
	// <div class="n-progress" v-show="loadingIframe"></div>
	background: linear-gradient(90deg, #82bcff 25%, #0077ff 37%, #a7d0ff 63%);
	position: sticky;
	top: 0;
	width: 100%;
	height: 4px;
	animation: skeleton-loading 1.4s ease infinite;
}
</style>
