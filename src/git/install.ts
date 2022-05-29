import { exists } from 'fs'
import { promisify } from 'util'
import ora from 'ora'
import simpleGit from 'simple-git'
import {
  getGlobalWorkSpace,
  getRepositoryDirName,
  INodePageConfig,
  normalizeMirrorConfig,
} from '../store'
import { log } from '../utils/logger'

const debug = (...args: any[]) => log('--git:install--', ...args)

/**
 * 安装项目
 * @param repository 远程仓库地址
 */
export async function cloneRepository(repository: string, depth: number, branch: string) {
  const dirName = getRepositoryDirName(repository)
  const git = simpleGit()

  debug(`安装项目：public/${dirName}`)
  const spinner = ora(`安装项目：public/${dirName}`).start()
  return git
    .clone(
      repository,
      getGlobalWorkSpace(`public/${dirName}`),
      ['-b', branch, '--depth', depth.toString()],
      (err: any) => {
        if (err) {
          debug('err', err)
        }
      },
    )
    .then((result) => {
      spinner.text = result
      spinner.clear().stop()
      return true
    })
    .catch((error) => {
      if (error && typeof error === 'string') {
        spinner.text = error
      }
      spinner.clear().stop()
      return false
    })
}

/**
 * 更新项目
 * @param repository 远程仓库地址
 */
export function updateRepository(repository: string) {
  const dirName = getRepositoryDirName(repository)
  const git = simpleGit()
  const spinner = ora(`更新项目：public/${dirName}`).start()
  return git.cwd(getGlobalWorkSpace(`public/${dirName}`))
    .pull()
    .then((result) => {
      spinner.text = result.files.join('\n')
      spinner.clear().stop()
      return true
    })
    .catch((error) => {
      if (error && typeof error === 'string') {
        spinner.text = error
      }
      spinner.clear().stop()
      return false
    })
}

/**
 * 判断代码库是否已经clone初始化完成
 * @param repository
 * @returns
 */
export async function isInitializedRepository(repository: string) {
  try {
    const dirName = getRepositoryDirName(repository)
    const isExist = await promisify(exists)(getGlobalWorkSpace(`public/${dirName}`)).catch(() => false)
    if (!isExist) {
      return false
    }
    const git = simpleGit()
    const isRepo = await git.cwd(getGlobalWorkSpace(`public/${dirName}`)).checkIsRepo()
    return isRepo
  } catch (error) {
    debug(error)
    return false
  }
}

/**
 * 下载仓库
 * @param config 安装代码库
 */
export async function install(config: INodePageConfig) {
  const tasks = config.mirrors.map(async (mirror) => {
    // 检查配置项，重新执行一遍克隆流程， 若public目录下，已经存在了配置中的本地代码库就更新它，否则，就去远程clone下来
    const { repository, branch, depth } = normalizeMirrorConfig(mirror)
    const isInitialized = await isInitializedRepository(repository)
    return isInitialized
      ? updateRepository(repository)
      : cloneRepository(repository, depth, branch)
  })
  return Promise.all(tasks)
}

/**
 * 新增配置文件
 * @param repository 仓库地址
 * @param depth clone的层级， 默认=1
 * @param branch clone的分支 默认=master
 * @returns {Promise<boolean>}
 */
export async function add(repository: string, depth?: number, branch?: string) {
  try {
    depth = depth || 1
    branch = branch || 'master'
    // 需要返回代码是否克隆成功的状态布尔值
    const isSuccessful = await cloneRepository(repository, depth, branch)
    return isSuccessful
  } catch (error) {
    debug(error)
    return false
  }
}
