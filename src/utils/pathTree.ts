import { dirname } from 'path'
import { walkSync } from '@nodelib/fs.walk'
import { getGlobalWorkSpace } from '../store'

interface FlatPath {
  [s: string]: any
  type: 'file' | 'dir'
  path: string
}

export const compareBasename = (a: FlatPath, b: FlatPath) => {
  if (a.type === 'dir' && b.type === 'file') {
    return -1
  }
  if (a.type === 'file' && b.type === 'dir') {
    return 1
  }
  if (a.path.toLowerCase() < b.path.toLowerCase()) {
    return -1
  }
  if (a.path.toLowerCase() > b.path.toLowerCase()) {
    return 1
  }
  return 0
}

export const getParentDirectories = (pathItem: FlatPath) => {
  const rootDirPath = pathItem.type === 'file' ? dirname(pathItem.path) : pathItem.path
  const _dirs = new Set([rootDirPath])
  const _getDir = (_path: string, dirs: Set<string>) => {
    const _parentDirPath = dirname(_path)
    if (_parentDirPath !== '.' && _parentDirPath !== '/') {
      dirs.add(_parentDirPath)
      _getDir(_parentDirPath, dirs)
    }
  }
  _getDir(rootDirPath, _dirs)
  return Array.from(_dirs)
}

export const readProjectPath = (project: string) => {
  return walkSync(getGlobalWorkSpace(project))
}

export const collect = (pathItems: FlatPath[]) => {
  const directoryItems = Array.from(new Set(pathItems.map(getParentDirectories).flat()))
    .map<FlatPath>(path => ({
      path,
      type: 'dir',
    }))
  const fileItems = pathItems.filter(item => item.type === 'file')
  const allItems = [...fileItems, ...directoryItems].sort(compareBasename)
  const nodes = allItems.map(item => `${item.type}:${item.path}`)
  const edges = allItems.reduce<Partial<FlatPath>>((allEdges, node) => {
    const parentDirname = dirname(node.path)
    const key = `dir:${parentDirname}`
    if (allEdges[key]) {
      allEdges[key].push(`${node.type}:${node.path}`)
    } else {
      allEdges[key] = [`${node.type}:${node.path}`]
    }
    return allEdges
  }, {})
  const data = allItems.reduce<Partial<FlatPath>>((allData, item) => {
    allData[`${item.type}:${item.path}`] = item
    return allData
  }, {})
  return {
    data,
    edges,
    nodes,
  }
}
