/* eslint-disable no-console */
import chalk from 'chalk'

export const log = (...args: any[]) => console.info(chalk.green.bold('nodepage'), ...args)
export const logError = (...args: any[]) => console.info(chalk.red.bold('nodepage'), ...args)
export const logWran = (...args: any[]) => console.info(chalk.yellow.bold('nodepage'), ...args)
