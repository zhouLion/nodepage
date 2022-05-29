
# 在线文档系统

<div style="text-align: center;">
  <img src="pic-moren.png">
  <div>📃在线文档</div>
</div>

## 介绍
> 本系统设计灵感来自[github pages](https://pages.github.com/)，产品和设计人员上传原型或设计稿文件到 git 仓库后，后台会实时解析代码目录结构，自动发布静态服务，用户可直接使用浏览器访问静态服务的链接，在线查看更新后的文档。

> 节省研发人员下载、解压、打开浏览器查看的时间，提高整体效率。
<!-- - 工作空间模式： 产品制作原型 -> 本地压缩打包 -> 打开浏览器登录工作空间 ->  -->

## 安装
本系统使用一个 npm 包 --- `nodepage` 部署启动，这个包里使用 `Vue` + `Nodejs` + `Git` 去处理前端页面、后端接口服务、文档数据管理方面的业务。

### 运行依赖
- 服务器：
  - 安装了 git，并且配置了ssh key到代码库
  - 有 git 仓库地址访问权限
- Nodejs > 8

### 全局安装
``` sh
npm install -g nodepage
```

### 所有命令
- **nodepage用法指引📖** 全局命令 `nodepage`
``` sh
nodepage help # 或者 nodepage

# nodepage用法指引📖
#   打印指令用法说明
#   - nodepage help

#   启动本地服务，可在当前目录开启一个静态服务
#   - nodepage local

#   添加一个项目代码仓库
#   - nodepage add <repository-url> [options]
#     options:
#       --branch,-b: 分支
#       --name,-n: 项目名称, 默认=仓库地址中末节点的名称
#       --depth,-d: 拷贝层级，默认=1

#   启动一个依赖代码仓库的服务
#   - nodepage serve [options]
#     options:
#       --port,-p: 指定端口, 默认=8888
#       --interval: 定时器，定时pull代码库, 默认=60000即1分钟，且不能少于1分钟

#   打印配置项
#   - nodepage config
```


## 如何在服务器端部署

### 开启服务
```bash
# 全局安装
npm install -g nodepage

# 添加仓库
nodepage add <git仓库地址> --name <项目名称>

# nodepage serve 是启动命令
# 建议使用 **nohup** 后台启动，并在启动的目录打印存储日志文件，一路回车
nohup nodepage serve -p 8088 &

# 打开 nohup.out 日志，可查看项目运行的地址,对外路径为 http://<外网ip>:<port>/app/project/<配置项中项目名称>
cat nohup.out
```

### 停止服务
```bash
# grep查找pid
ps -ef | grep node
# 通过pid停止pid指向的进程
kill -9 <pid>
```

- - - - - - - 

## 如何在本地启动静态服务
如果你有一个文件夹专门存放你下载的项目原型文档的话，你可以在这个文件夹下一键启动静态服务
```bash
# 到需要启动静态页面的目录
cd <需要启动静态页面的路径>
# 启动本地服务
nodepage local -p <端口号：默认 80>
```

## 更新日志
### 1.1.2
- fix: git log 的统计点变更为文件所在的父级目录
### 1.1.1
- fix: 兼容 v1.0 git 的日志打印的日期格式化问题
### 1.1.0
- feature: 显示更新记录
### 1.0.13 
- fixed: 修复错误的文件后缀正则表达式
### 1.0.8
- feature：支持`xmind`文件
### 1.0.7
- fixed： 浏览器缓存
### 1.0.6
- 新增文件过滤
### 1.0.5
- 新增docx文件预览功能
- 文本资源gzip压缩
### 1.0.4
- 新增xlsx文件预览功能
- 记忆侧边栏状态


## 待办事项
- [-] 优化左侧目录树的层级展示、条件过滤
- [-] git 使用 webhook，取代定时器机制
- [-] 权限隔离admin、master、reader，需要引入数据库
- [-] 文件更细后，客户端消息推送，需要用户体系，socket io 协议实现
- [-] 设计稿素材文件可快捷展示、下载
- [-] 无需上传 zip 文件，通过 index.html 追溯文件包，调用后台执行压缩下载
- [-] ...
- [-] ...
