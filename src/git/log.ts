import { dirname } from 'path'
import { statSync } from 'fs'
import simpleGit from 'simple-git'

export function logDir(fileOrDir: string) {
  const git = simpleGit()
  const dir = statSync(fileOrDir).isFile() ? dirname(fileOrDir) : fileOrDir
  return git.cwd(dir)
    .log({
      file: dir,
      format: {
        hash: '%H',
        message: '%s',
        refs: '%d',
        body: '%b',
        author_name: '%aN',
        author_email: '%aE',
        date: '%ai',
      },
    })
}
