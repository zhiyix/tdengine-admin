const { defineConfig } = require('@vue/cli-service')
const path = require("path")
const webpack = require("webpack")
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.103:6041/',
        ws: true,
        changOrigin: true,
        logLevel: "debug",
        pathRewrite: {
            '^/api': '' // 思路是如果是开发环境，就给所有要代理的接口统一加上前缀，然后代理请求时再统一通过rewrite去掉
        }
      }
    }
  }
})
