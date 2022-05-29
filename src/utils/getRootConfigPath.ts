import os from 'os'
import path from 'path'
import fs from 'fs-extra'

const APP_NAME = 'nodepage'

const xdgConfigPath = (file: string) => {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME
  if (xdgConfigHome) {
    const rcDir = path.join(xdgConfigHome, APP_NAME)
    if (!fs.existsSync(rcDir)) {
      fs.ensureDirSync(rcDir, 0o700)
      return null
    }
    return path.join(rcDir, file)
  }
  return null
}

const getLocalConfigPath = () => {
  if (process.env.NODE_ENV === 'local') {
    return process.cwd()
  }
  return null
}

/**
 * 获取全局配置的路径
 * @param file
 * @returns
 */
export const getRootConfigPath = (file: string) => {
  return (
    getLocalConfigPath()
    || xdgConfigPath(file)
    || path.join(os.homedir(), file)
  )
}
