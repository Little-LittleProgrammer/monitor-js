# 2.4.0(2022-12-10)
### BREAKING CHANGES(future)
1. 增加微信小程序支持
2. 增加用户行为栈数据收集, 并在发生错误时上报

# 2.3.0(2022-08-20)
### BREAKING CHANGES
1. 增加 用户行为数据收集 功能插件

# 2.2.6(2022-08-09)
### BREAKING CHANGES
1. 打包脚本 更新脚本 增加release前进行包体积监测, 不合格不予通过
2. 增加快速生成`export * from 'xxx'`的脚本, 减少功能开发时要一遍一遍输入`export * from 'xxx'`
3. `build`命令会替换`example`下的js文件

### UPDATE
1. 更新文档
2. 更新案例并布置
3. 数据类型整理
4. 更换 `packageManager` 为 `pnpm`

### BUG FIX
1. 修复 api-extractor 生成的d.ts文件错误问题
2. 恢复上报数据缓存重新记录到内存	

# 2.2.5(2022-08-01)
### BREAKING CHANGES
1. 增加 自定义上报 功能
2. 更改打包脚本
3. 增加 example 文件
4. 上报数据缓存记录到localStorage, 并简单加密
### BUG FIX
1. 修复 cls 计算上报错误

# 2.2.0(2022-07-28)
### BREAKING CHANGES
1. 正式版发布
2. 完成 性能收集

# 2.1.1
### feat
1. 完成部分测试用例
2. 增加img上报方式

### Bug Fixes
1. 修复数据上报失效的错误

# 2.1.0
### BREAKING CHANGES
1. 完成 错误收集

# 2.0.1- 2.0.9
### BREAKING CHANGES
1. 框架搭建

# 2.0.1
1. 初始化架构

# 2.0.0
### BREAKING CHANGES
1. 采用mono repo方式重构
2. 更名为 QMonitor

# 1.1.0
### BREAKING CHANGES
1. 正式版发布(qm-web-monitor-sdks)
2. 性能监控支持
3. 错误监控支持
4. 不阻塞的上报方式支持
5. 采样率支持

# 1.0.1
### BREAKING CHANGES
1. 完成基本工具类

# 1.0.0
### BREAKING CHANGES
1. sdk初始化