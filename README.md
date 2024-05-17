# quantum-monitor

## 介绍
一款 web 监控与统计sdk

包括的功能
1. 性能监控: FP、FCP、FMP、navigator、resource、FID、LCP、CLS
2. api监控: fetch、xhr
3. 错误监控: JS、resource、console.error、promise、vue、react
4. 行为数据: click、hash-router、history-router、pv
5. 自定义上报
6. 多端支持: browser、wx-mini(规划中)
7. 所有功能都可配置开启和关闭

## 老版本
`v1`版本请看 [web-monitor-sdk](https://github.com/Little-LittleProgrammer/web-monitor-sdk)

## Usage

### 浏览器vue项目

```bash
npm install @qmonitor/browser
npm install @qmonitor/vue
```

```js

import { init } from '@qmonitor/browser';
import { vuePlugin } from '@qmonitor/vue';

init({
    url: 'http://localhost:8083/reportData',
    appName: '量子低代码',
    appID: 'quantum',
    cacheNum: 10,
    vue,
}, [vuePlugin]);
```