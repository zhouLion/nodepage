import {
  existsSync,
  mkdirSync,
  readdir,
  readFile,
  stat,
  writeFile,
  writeFileSync,
} from 'fs'
import { join, parse } from 'path'
import { promisify } from 'util'
import { walk } from '@nodelib/fs.walk'
import { getRootConfigPath } from '../utils/getRootConfigPath'
import { log, logError } from '../utils/logger'

const WHITE_LIST = /\.(pdf|xls|xlsx|ppt|pptx|doc|docx|tar|7z|7zip|zip|md|xmind)$/

const DEFAULT_CONFIG = {
  branch: 'master',
  depth: 1,
}

const debug = (...args: any[]) => log('--store--', ...args)

const pfsReadFile = promisify(readFile)
const pfsWriteFile = promisify(writeFile)
const pfsReadDir = promisify(readdir)
const pfsStat = promisify(stat)

const isTemp = () => process.env.NODE_ENV === 'local'

/**
 * 设置全局的工作空间, 会生成一个全局的目录， 默认在用户根目录下创建，即~/.nodepage
 * @returns
 */
export function getGlobalWorkSpace(subPath?: string) {
  if (isTemp()) {
    debug(join(process.cwd(), subPath || ''))
    return join(process.cwd(), subPath || '')
  }
  const globalWorkSpace = getRootConfigPath('.nodepage')
  initGlobalWorkSpace(globalWorkSpace)
  return join(globalWorkSpace, subPath || '')
}

/**
 * 初始化全局配置项
 * @param globalWorkSpace 全局路径
 * @returns
 */
function initGlobalWorkSpace(globalWorkSpace: string) {
  if (existsSync(join(globalWorkSpace, 'public'))) {
    return
  }
  try {
    debug(join(globalWorkSpace, 'public'), logError('不存在，程序正在初始化'))
    mkdirSync(join(globalWorkSpace, 'public'), {
      recursive: true,
    })
    // 写入默认的配置
    const config = JSON.stringify({
      interval: 60000,
      mirrors: [],
      port: 8888,
      publicPath: 'prototype',
      staticPath: '.nodepage',
    }, null, 2)
    writeFileSync(join(globalWorkSpace, 'nodepage.json'), config, {
      encoding: 'utf8',
    })
    debug(join(globalWorkSpace, 'public'), '初始化配置已完成')
  } catch (error) {
    process.stderr.write(error.message)
    process.exit(1)
  }
}

export interface INodePageMirror {
  /**
   * 远程仓库地址
   * @description git仓库的ssh或者http地址，需保证服务器用户有pull权限
   */
  repository: string
  /**
   * 拷贝层级
   * @default 1 默认浅拷贝
   */
  depth?: number
  /**
   * 原型空间名称 默认是仓库名
   */
  name?: string
  /**
   * 仓库分支
   * @default master
   */
  branch?: string
}

/**
 * 仓库配置
 */
export type IMirror = string | INodePageMirror

export interface INodePageConfig {
  /**
   * 静态页面的服务节点名称
   */
  publicPath?: string
  /**
   * 服务端口
   */
  port?: number
  /**
   * 定时拉取代码库
   */
  interval?: number | boolean
  /**
   * 仓库配置列表
   */
  mirrors: IMirror[]
}

/**
 * 根据仓库url地址，截取出项目名称
 * @param repository 仓库的url
 */
export function getRepositoryDirName(repository: string) {
  if (isTemp()) {
    const part = repository.split('/')
    const lastPart = part[part.length - 1]
    return lastPart
  }
  return parse(repository).name
}

/**
 * 配置项简单模版函数， 仅提供类型提示
 * @param config 输入配置
 */
export function initConfig(config: INodePageConfig): INodePageConfig {
  return config
}

/**
 * 读取配置文件
 */
export function readConfigFile() {
  debug('readConfigFile')
  return pfsReadFile(getGlobalWorkSpace('nodepage.json'), 'utf8')
    .then((output) => {
      const nodepageConfig = (JSON.parse(output)) as INodePageConfig
      return nodepageConfig
    })
    .catch((_error) => {
      return null
    })
}

/**
 * 更新配置，将配置信息写入配置文件
 * @param config 配置信息
 * @returns
 */
export function writeConfigToFile(config: INodePageConfig) {
  debug('writeConfigToFile')
  return pfsWriteFile(getGlobalWorkSpace('nodepage.json'), JSON.stringify(config, null, 2), 'utf8')
}

/**
 * 规格化仓库配置
 * @param mirror 镜像地址
 */
export function normalizeMirrorConfig(mirror: IMirror) {
  // 字符串配置的补上depth和branch参数
  if (typeof mirror === 'string') {
    return {
      branch: DEFAULT_CONFIG.branch,
      depth: DEFAULT_CONFIG.depth,
      name: getRepositoryDirName(mirror),
      repository: mirror,
    }
  } else {
    const { branch = DEFAULT_CONFIG.branch, repository, depth = DEFAULT_CONFIG.depth, name } = mirror
    return {
      branch,
      depth,
      name: name || getRepositoryDirName(repository),
      repository,
    }
  }
}

export async function walkOnRepository(repositoryName: string) {
  const config = await readConfigFile()
  const publicPath = config && config.publicPath ? config.publicPath : 'prototype'
  // temp 即在指定目录执行 nodepage local,已当前目录启动静态服务
  const repositoryDir = isTemp()
    ? join(getGlobalWorkSpace(), repositoryName)
    : join(getGlobalWorkSpace(), 'public', repositoryName)
  return promisify(walk)(repositoryDir, {
    basePath: join('/', publicPath, repositoryName),
    deepFilter(item) {
      return item.name !== '.git'
        || !item.name.includes('DS_Store')
        || !item.name.includes('node_modules')
        || !item.name.includes('__MACOSX')
    },
    entryFilter(item) {
      return item.name === 'index.html' || WHITE_LIST.test(item.name)
    },
  })
}

export async function readCwd() {
  const basePath = process.cwd()
  const files = await pfsReadDir(join(basePath))
  const promiseStats = files.map(async (file) => {
    const subPath = join(basePath, file)
    const tStat = await pfsStat(subPath)
    return {
      file: subPath,
      stat: tStat,
    }
  })
  const subInfoes = await Promise.all(promiseStats)
  return subInfoes.filter((info) => {
    return !(/(node_modules|.git|.bin)/).test(info.file)
      && info.stat.isDirectory()
  })
}

export const isLocal = () => process.env.NODE_ENV === 'local'
