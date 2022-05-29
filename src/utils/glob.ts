/* eslint-disable no-console */
import { dirname } from 'path'
import { statSync } from 'fs'
import glob from 'glob'

export function memoize<T>(fn: (params: string) => T, decline: number) {
  const cache: Map<string, {
    timestamp: number
    value: T
  }> = new Map()

  function cached(this: any, val: string) {
    if (cache.has(val)) {
      const entity = cache.get(val)
      if (entity) {
        if (Date.now() - entity.timestamp > decline) {
          cache.set(val, {
            timestamp: Date.now(),
            value: fn.call(this, val),
          })
        }
      } else {
        cache.set(val, {
          timestamp: Date.now(),
          value: fn.call(this, val),
        })
      }
    } else {
      cache.set(val, {
        timestamp: Date.now(),
        value: fn.call(this, val),
      })
    }
    const entity = cache.get(val)
    if (entity) {
      return entity.value
    }
    return null
  }

  cached.cache = cache

  return cached
}

export function getDir(dirOrFilePath: string) {
  return statSync(dirOrFilePath).isDirectory()
    ? dirOrFilePath
    : dirname(dirOrFilePath)
}

export function listAllImages(dirOrFilePath: string) {
  const dir = getDir(dirOrFilePath)
  const files = ['png', 'jpeg', 'jpg', 'gif', 'svg'].map((ext) => {
    return {
      extensions: ext,
      dir,
      files: glob.sync(`**/*.${ext}`, {
        cwd: dir,
        root: dir,
      }),
    }
  })
  return files
}

export const memoizeListAllImages = memoize(listAllImages, 60 * 1000 * 30)
