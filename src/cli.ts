import chalk from 'chalk'
import minimist from 'minimist'
import { add, install } from './git'
import { startTmp } from './server'
import { getRepositoryDirName, readConfigFile, writeConfigToFile } from './store'
import serve from './index'

const rawArgv = process.argv.slice(2)

const argvs = minimist(rawArgv)

const command = argvs._.splice(0, 1)[0]

const tasks = argvs._.map(repository => execAddRepository(repository, argvs))

const port = argvs.port || argvs.p
const publicPath = argvs.publicPath
const interval = argvs.interval
const input: any = {}

switch (command) {
  case 'help':
    execPrintUsage()
    break

  case 'add':
    Promise.all(tasks).then((tasksResult) => {
      readConfigFile().then((config) => {
        if (config) {
          tasksResult.forEach((mirror) => {
            if (mirror) {
              config.mirrors.push(mirror)
            }
          })
          writeConfigToFile(config)
        }
      })
    })
    break

  case 'serve':
    if (port) {
      input.port = port
    }
    if (publicPath) {
      input.publicPath = publicPath
    }
    if (interval) {
      input.interval = interval
    }
    serve(input)
    break

  case 'config':
    readConfigFile().then((config) => {
      if (config) {
        // eslint-disable-next-line no-console
        console.log(chalk.yellow(JSON.stringify(config, null, 2)))
      }
    })
    break

  case 'install':
    readConfigFile().then((config) => {
      if (config) {
        install(config)
      }
    })
    break

  case 'local':
    startTmp({ port: argvs.port || argvs.p })
    break

  default:
    execPrintUsage()
    break
}

/**
 *
 * @param repository 代码仓库url
 * @param argv 参数
 * @returns
 */
async function execAddRepository(repository: string, argv: minimist.ParsedArgs) {
  if (!repository) {
    process.stderr.write('指令： nodepage add <repository>中，repository 仓库名称必填！')
    process.exit(-1)
  }
  const branch = argv.branch || argv.b || 'master'
  const depth = argv.depth || argv.d || 1
  const name = argv.name || argv.n || getRepositoryDirName(repository)
  console.log(branch, depth)
  const isAdded = await add(repository, depth, branch)
  return isAdded
    ? { repository, branch, depth, name }
    : false
}

function execPrintUsage() {
  // TODO nodepage serve --publicPath: 静态服务分发节点，默认=prototype, 不能设置为app和api，这两个节点分配了其他服务
  process.stdout.write(`
    ${chalk.bold.cyan('nodepage用法指引📖')}

    ${chalk.bold.white('打印指令用法说明')}
    ${chalk.cyan('- nodepage help')}

    ${chalk.bold.white('启动本地服务，可在当前目录开启一个文档服务')}
    ${chalk.cyan('- nodepage local')}

    ${chalk.bold.white('添加一个仓库')}
    ${chalk.cyan('- nodepage add <repository-url> [options]')}
      options:
        --branch,-b: 分支
        --name,-n: 项目名称, 默认=仓库地址中末节点的名称
        --depth,-d: 拷贝层级，默认=1

    ${chalk.bold.white('启动服务')}
    ${chalk.cyan('- nodepage serve [options]')}
      options:
        --port,-p: 指定端口, 默认=8888
        --interval: 定时器，定时pull代码库, 默认=60000即1分钟，且不能少于1分钟

    ${chalk.bold.white('输出配置项')}
    ${chalk.cyan('- nodepage config')}

  `)
}
