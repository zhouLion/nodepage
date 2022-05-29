const { resolve } = require('path')

// 类型提示
/** @type {import("@vue/cli-service").ProjectOptions} */
module.exports = {
  lintOnSave: false,
  publicPath: '/app',
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.module.rules.delete('svg')
    config.module
      .rule('svg-sprite-loader')
      .test(/\.svg$/)
      .include.add(resolve(__dirname, 'src/assets/icons')) // 处理svg目录
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .options({
        externalConfig: 'svgo.config.yml',
      })
  },
  devServer: {
    host: '0.0.0.0',
    port: '8084',
    // 本地通过 nodepage local -p 8888 启动一个nodepage服务
    proxy: {
      '^/api': {
        target: 'http://localhost:8888',
      },
      '^/prototype': {
        target: 'http://localhost:8888',
      },
    },
  },
}
