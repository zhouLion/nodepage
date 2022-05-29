import bodyParser from 'body-parser'
import express, { Response } from 'express'
import { join } from 'path'
import { logDir } from '../git'
import {
  getRepositoryDirName,
  normalizeMirrorConfig,
  readConfigFile,
  walkOnRepository,
  isLocal,
  getGlobalWorkSpace,
} from '../store'
import { memoizeListAllImages } from '../utils/glob'

const errorResponse = (res: Response, err?: Error) => {
  res.json({
    code: '404',
    msg: err ? err.message : '未知错误',
    data: null,
  })
}

const apiRouter = express.Router()

apiRouter.use(bodyParser.urlencoded({ extended: false }))
apiRouter.use(bodyParser.json())

apiRouter.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', 'Express')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

apiRouter.get('/doc/configs', (_req, res) => {
  res.json({
    code: '000000',
    data: {
      isShowProjectsSelector: isLocal(),
    },
    errorMsg: null,
  })
})

apiRouter.get('/projects', (_req, res) => {
  readConfigFile().then((config) => {
    if (config) {
      res.json({
        code: '000000',
        data: config.mirrors.map((mirror) => {
          const { name, repository } = normalizeMirrorConfig(mirror)
          const projectId = getRepositoryDirName(repository)
          return { name, projectId }
        }),
        errorMsg: null,
      })
    } else {
      res.json({
        code: '000001',
        data: null,
        errorMsg: '未查询到数据',
      })
    }
  }).catch((error) => {
    res.status(500).send(error)
  })
})

apiRouter.get('/project/menu-list', (req, res) => {
  const { projectId } = req.query
  if (!projectId) {
    res.json({
      code: '000002',
      data: null,
      errorMsg: '参数不存在',
    })
  } else {
    walkOnRepository(projectId).then((entries) => {
      entries.forEach((d) => {
        const regx = new RegExp(projectId)
        d.path = d.path.replace(regx, a => encodeURIComponent(a).replace(/%/g, ''))
      })
      res.json({
        code: '000000',
        data: entries,
        errorMsg: null,
      })
    })
  }
})

apiRouter.post('/project/add', (_req, res) => {
  // TODO: 通过接口添加项目
  res.end()
})

apiRouter.get('/project/log', (req, res) => {
  if (isLocal()) {
    errorResponse(res)
  } else {
    const { file } = req.query
    logDir(getGlobalWorkSpace(`public/${file}`)).then((log) => {
      res.json(log)
    }).catch(() => {
      errorResponse(res)
    })
  }
})

apiRouter.get('/project/assets/images', (req, res) => {
  const { file } = req.query
  const fileDirRelative = file.replace('index.html', '')
  try {
    const images = memoizeListAllImages(getGlobalWorkSpace(`public/${file}`))
    res.json({
      data: images
        ? images.map(({ extensions, files }) => {
          return {
            // dir,
            extensions,
            files: files.map(file => join('/prototype/', fileDirRelative, file)),
          }
        })
        : [],
      code: '000000',
      msg: '',
    })
  } catch (error: any) {
    errorResponse(res, error)
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
apiRouter.post('/user/login', (_req, res, _next) => {
  // TODO
  res.end()
})

apiRouter.get('')
export default apiRouter
