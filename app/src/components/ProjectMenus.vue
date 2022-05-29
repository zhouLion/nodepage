<template>
  <ul class="project-menu-group">
    <li v-for="(item, index) in menus" :key="index" class="menu-item">
      <template v-if="item.children && item.children.length > 0">
        <div
          class="folder"
          @click="$set(item, 'collapse', item.collapse ? false : true)"
        >
          <i
            class="el-icon-arrow-down"
            :class="{
              collapsed: item.collapse,
            }"
          ></i>
          <span class="title">
            {{ item.name }}
          </span>
        </div>

        <!-- 递归一层 -->
        <project-menus
          v-show="!item.collapse"
          v-model="vModel"
          :type="type"
          :menus="item.children"
          @show-more="(files) => $emit('show-more', files)"
          @click="onClickItem"
          @preview="onPreview"
        ></project-menus>
      </template>

      <template v-else>
        <div
          :class="{
            file: true,
            actived: item.path === vModel,
          }"
          :title="item.name"
          @click="onClickItem(item)"
        >
          <div class="left">
            <icon size="normal" :name="getIconName(item.path)"></icon>
            <span class="title">
              {{ item.name }}
            </span>
          </div>

          <div class="actions">
            <div
              v-if="isExcel(item.path)"
              @click.prevent="onPreviewOffice(item, 'excel')"
            >
              <icon
                name="ic-preview"
                :style="{
                  top: '-1px',
                  position: 'relative'
                }"
                color="hsl(243, 80%, 62%)"
              >
              </icon>
            </div>
            <div
              v-if="isWord(item.path)"
              @click.prevent="onPreviewOffice(item, 'word')"
            >
              <icon
                name="ic-preview"
                :style="{
                  top: '-1px',
                  position: 'relative'
                }"
                color="hsl(243, 80%, 62%)"
              >
              </icon>
            </div>

            <div v-if="isDownloadable(item.path)">
              <a
                :download="item.name"
                :href="item.path"
                class="downloadable"
                @click="onClickedDownloadLink"
              >
                <icon name="ic-download"></icon>
              </a>
            </div>

            <div v-if="type === 'design' && !isDownloadable(item.path)" @click.stop="moreHandler(item.path)">
              <el-tooltip content="探索图片资源" placement="top" effect="dark">
                <!-- content to trigger tooltip here -->
                <icon name="ic_bomb"></icon>
              </el-tooltip>
            </div>

            <div>
              <el-popover
                placement="right"
                width="400"
                trigger="hover"
                @after-enter="mouseoverHandler(item.path)"
              >
                <div slot="reference">
                  <i class="el-icon-info"></i>
                </div>
                <el-table
                  v-if="fileLogInfo(item.path) && fileLogInfo(item.path).status === 'done'"
                  :data="fileLogInfo(item.path).data"
                  stripe
                  max-height="250"
                >
                  <el-table-column v-slot="{row}" prop="author_name" label="提交人" :width="100">
                    <a :href="`mailto:${row.author_email}`" target="_blank">📧 {{ row.author_name }}</a>
                  </el-table-column>
                  <el-table-column v-slot="{row}" prop="date" label="提交时间" :width="100">
                    <timeago :datetime="row.date" :auto-update="60" locale="zh-CN"></timeago>
                  </el-table-column>
                  <el-table-column prop="message" label="提交信息" :width="150">
                  </el-table-column>
                </el-table>

                <Skeleton v-else></Skeleton>
              </el-popover>
            </div>
          </div>
        </div>
      </template>
    </li>
  </ul>
</template>

<script>
import Vue from 'vue'
import VueTimeago from 'vue-timeago'
import zh_cn from 'vue-timeago/node_modules/date-fns/locale/zh_cn'
import Skeleton from './Skeleton.vue'

Vue.use(VueTimeago, {
  name: 'Timeago', // Component name, `Timeago` by default
  locale: 'zh-CN', // Default locale
  locales: {
    'zh-CN': zh_cn,
  },
})

export default Vue.extend({
  name: 'ProjectMenus',
  components: {
    Skeleton,
  },
  props: {
    type: String,
    menus: {
      type: Array,
    },
    depth: {
      type: Number,
      default: 0,
    },
    value: {
      type: String,
    },
  },
  data() {
    return {
      logInfoes: {},
    }
  },
  computed: {
    fileLogInfo() {
      return (filePath) => {
        return this.logInfoes[filePath]
      }
    },
    vModel: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      },
    },
  },
  methods: {
    mouseoverHandler(path) {
      if (!this.logInfoes[path]) {
        this.$set(this.logInfoes, path, {
          status: 'default',
          data: [],
        })
      }
      if (['loading', 'done'].includes(this.logInfoes[path].status)) {
        return false
      }
      this.logInfoes[path].status = 'loading'
      const file = path.replace('/prototype/', '')
      fetch(`/api/project/log?file=${file}`)
        .then(res => res.json())
        .then((data) => {
          this.$set(this.logInfoes, path, {
            status: 'done',
            data: data.all,
          })
        })
        .catch(() => {
          this.$set(this.logInfoes, path, {
            status: 'default',
            data: [],
          })
        })
    },

    moreHandler(path) {
      const file = path.replace('/prototype/', '')
      fetch(`/api/project/assets/images?file=${file}`)
        .then(res => res.json())
        .then((json) => {
          this.$emit('show-more', json.data)
        })
    },

    onClickedDownloadLink(evt) {
      const evtTarget = evt.currentTarget
      evtTarget.classList.add('active')
      const timer = setTimeout(() => {
        evtTarget.classList.remove('active')
        clearTimeout(timer)
      }, 2000)
    },

    onClickItem(item) {
      if (this.isDownloadable(item.path)) {
        if (this.isExcel(item.path)) {
          this.onPreviewOffice(item, 'excel')
        }
        if (this.isWord(item.path)) {
          this.onPreviewOffice(item, 'word')
        }
        return
      }
      // this.vModel = item.path;
      this.$emit('click', item)
    },

    onPreview(href) {
      this.$emit('preview', href)
    },

    isExcel(path) {
      const affix = this.getAffix(path)
      return /xls|xlsx/.test(affix)
    },

    isWord(path) {
      const affix = this.getAffix(path)
      return /docx/.test(affix)
    },

    isDownloadable(path) {
      const affix = this.getAffix(path)
      const WHITE_LIST = /pdf|xls|xlsx|ppt|pptx|doc|docx|tar|7z|7zip|zip|md|xmind$/
      return WHITE_LIST.test(affix)
    },

    onPreviewOffice(item, type) {
      const routeConfig = this.$router.resolve({
        name: 'preview',
        query: {
          type,
          src: item.path,
        },
      })
      this.$emit('preview', routeConfig.href)
    },

    getAffix(path) {
      const pathPartial = path.split('.')
      const affix = pathPartial[pathPartial.length - 1].toLowerCase()
      return affix
    },

    getIconName(path) {
      const affix = this.getAffix(path)
      if (/xls|xlsx/.test(affix)) {
        return 'ic-xlsx'
      }
      if (/doc|docx/.test(affix)) {
        return 'ic-doc'
      }
      if (/pdf$/.test(affix)) {
        return 'ic-pdf'
      }
      if (/ppt|pptx/.test(affix)) {
        return 'ic-ppt'
      }
      if (/htm(l)/.test(affix)) {
        return 'ic-folder'
      }
      if (/7z|7zip|zip|tar/.test(affix)) {
        return 'ic-archive'
      }
      return 'pic-moren'
    },
  },
})
</script>

<style lang="less">
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(6px);
  }
  60% {
    transform: translateY(-6px);
  }
}

.project-menu-group {
  list-style: none;
  padding-left: 12px;

  li.menu-item {
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;

    .folder,
    .file {
      padding: 8px 0;
      &:hover {
        background: #eee;
      }

      .title {
        width: 100%;
        text-overflow: ellipsis;
        word-spacing: normal;
        white-space: nowrap;
        overflow-x: hidden;
        padding-right: 14px;
      }
    }

    .folder {
      font-family: PingFangSC-Medium;
      font-weight: bolder;
      color: #333333;
      display: flex;
      align-items: center;
      font-size: 16px;
      .el-icon-arrow-down {
        margin-right: 4px;
        transition: all 0.3s ease;
      }

      .el-icon-arrow-down.collapsed {
        transform: rotate(-90deg);
      }
    }

    .file {
      font-family: PingFangSC-Regular;
      color: #272626;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 12px;

      .left {
        display: flex;
        flex: 1;
        align-items: center;
        width: calc(100% - 42px);
      }

      &.actived {
        color: #0077ff;
      }

      .svg-icon {
        margin-right: 4px;
      }
    }
  }

  .actions {
    display: flex;
    align-items: center;

    i.el-icon-info {
      color: #5851ec;
    }

    a, i {
      margin-left: 4px;
    }

    .downloadable {
      position: relative;

      &.active {
        animation: bounce 2s infinite;
      }

      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        fill: hsl(243, 80%, 62%);
      }
    }
  }

}
</style>
