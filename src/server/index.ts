import { join } from 'path'
import chalk from 'chalk'
import historyAPI from 'connect-history-api-fallback'
import express, { Express } from 'express'
import staicGzip from 'express-static-gzip'
import apiRouter from '../router/api'
import {
  getGlobalWorkSpace,
  getRepositoryDirName,
  INodePageConfig,
  normalizeMirrorConfig,
  readCwd,
  writeConfigToFile,
} from '../store'
import { findIPV4 } from '../utils/findIPs'
import { log } from '../utils/logger'

const debug = (...args: any[]) => log('--server--', ...args)

const LoggerMiddleWare: express.Handler = (req, _res, next) => {
  debug(new Date().toLocaleDateString(), req.url)
  next()
}

/**
 * 启动静态服务
 * @param config 配置项
 */
export function start(config: INodePageConfig) {
  const isLocal = () => process.env.NODE_ENV === 'local'
  const app = express()
  const publicPath = config.publicPath || 'prototype'
  const port = config.port || 8888
  const prototypesList: string[] = []

  config.mirrors.forEach((mirror) => {
    const tMirror = normalizeMirrorConfig(mirror)
    const dirName = getRepositoryDirName(tMirror.repository)
    // 解决中文路径编码问题，nodepage local
    const dirId = encodeURIComponent(dirName).replace(/%/g, '')
    const publicEndPoint = join(publicPath, dirId)
    const appEndPoint = join('app/project', dirName)
    const staticProxyPath = isLocal()
      ? getGlobalWorkSpace(dirName)
      : getGlobalWorkSpace(`public/${dirName}`)

    prototypesList.push(appEndPoint)
    // 每个原型的目录单独发布静态服务
    app.use(
      `/${publicEndPoint}/`,
      LoggerMiddleWare,
      express.static(staticProxyPath),
    )
  })

  app.use(
    '/app',
    (_req, res, next) => {
      // app 端点的请求，浏览器缓存
      res.setHeader('Cache-Control', 'no-cache,no-store')
      next()
    },
    historyAPI(),
    staicGzip(join(__dirname, '../../app/dist'), {}),
    // express.static(join(__dirname, "../../app/dist")),
  )

  app.use('/api', apiRouter)

  listenAPP(app, port)

  return app
}

/** 这里只启动一个服务 */
export function startAPIOnly(config: INodePageConfig) {
  const app = express()
  const port = config.port || 8888
  app.use('/api', apiRouter)
  listenAPP(app, port)

  return app
}

function listenAPP(app: Express, port: number) {
  app.listen(port, () => {
    debug(`${chalk.green('🚀服务启动成功：')} http://localhost:${port}/app/project`)
    findIPV4().forEach((info) => {
      debug(`${chalk.green('🚀服务启动成功：')} http://${info.address}:${port}/app/project`)
    })
  })
}

/**
 * 以当前目录为静态目录，启动一个服务
 */
export async function startTmp(config?: {
  port?: number
}) {
  process.env.NODE_ENV = 'local'
  const publicPath = 'prototype'
  readCwd().then((cwdInfoList) => {
    const dirs = cwdInfoList.map(dir => dir.file)
    const tempConfig: INodePageConfig = {
      interval: 0,
      mirrors: dirs,
      port: config && config.port ? config.port : 80,
      publicPath,
    }
    writeConfigToFile(tempConfig)
    start(tempConfig)
  })
}
