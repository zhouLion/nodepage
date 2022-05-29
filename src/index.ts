/* eslint-disable no-useless-catch */
import { install } from './git'
import { start } from './server'
import { readConfigFile } from './store'

export default function serve(serveConifg?: {
  port?: string
  publicPath?: string
  interval?: number
}) {
  readConfigFile().then(async (config) => {
    if (config) {
      Object.assign(config, serveConifg)
      validateConfig(config)
      process.stdout.write(JSON.stringify(config, null, 2))
      await install(config)
      start(config)
      if (config.interval && typeof config.interval === 'number') {
        // 更新间隔不得少于15s
        const interval = Math.max(config.interval, 15 * 1000)
        setInterval(() => {
          install(config)
        }, interval)
      }
    }
  })
}

/**
 * 配置合法性断言
 * @param config 输入配置
 */
function validateConfig(config: any) {
  try {
    config.publicPath = config.publicPath.replace('/\//g', '')
    config.interval = Number(config.interval)
    config.port = Number(config.port)
  } catch (error) {
    throw error
  }
  const { port, publicPath, interval, mirrors } = config
  if (typeof port !== 'number') {
    throw new TypeError('port 需要是数字类型')
  }
  if (typeof interval !== 'number') {
    throw new TypeError('interval 需要是数字类型')
  }
  if (!mirrors || mirrors.length === 0) {
    throw new TypeError('mirrors')
  }
  const keywords = ['api', 'app']
  if (keywords.includes(publicPath)) {
    throw new TypeError('publicPath 不能为以下关键字的服务节点：--- api，app ')
  }
}
