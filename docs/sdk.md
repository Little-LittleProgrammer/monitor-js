# web-monitor-sdk

## 背景

 - 传统模式下，一个前端项目发到正式环境后，所有报错信息只能通过用户使用时截图、口头描述发送到开发者，然后开发者来根据用户所描述的场景去模拟这个错误的产生，这效率肯定超级低
 - 所以很多开源或收费的前端监控平台就应运而生，比如:

* [sentry](https://github.com/getsentry/sentry)
* [webfunny](https://github.com/a597873885/webfunny_monitor)
* [fundebug](https://www.fundebug.com/)
* [阿里云前端监控(ARMS)](https://www.aliyun.com/product/arms)

等等一些优秀的监控平台

### 为什么要自研
1. 大部分好的前端监控平台都要收费
2. 可以根据自己的业务, 进行专门收集

## 监控系统的组成
![组成](./img//monitor%E7%BB%84%E6%88%90.png)
从上图可以看出来，如果需要自研监控平台需要做三个部分：
1. APP监控SDK：收集错误信息并上报
2. server端：接收错误信息，处理数据并分析存入数据库，而后根据告警规则通知对应的开发人员
3. 可视化平台：从数据存储引擎拿出相关错误信息进行渲染，用于快速定位问题

## SDK

### 简介
web-monitor-sdk: 是一套前端监控sdk, 包括收集
1. 错误数据
2. 性能数据
3. 自定义埋点上报
4. 用户行为数据(开发中)
5. wx小程序支持(开发中)

### 架构
> 借鉴了 vue3 和 mitojs 的代码

#### monorepo

**什么是 monorepo**
monorepo: (管理项目代码的一个方式，指在一个项目仓库 (repo) 中管理多个模块/包 (package)，不同于常见的每个模块建一个 repo).

目前大型的开源库:
    vue3、react、sentry、vite、nuxt、element-plus等等 都使用了monorepo的方式开发

monorepo的优势:
1. 可分模块打包、分模块发布(提高开发体验)
2. 代码结构清晰(降低耦合性，提高代码可读性)
3. 方便之引入需要使用的模块
4. 核心功能抽离, 封装 抽象类, 具体模块使用时继承(提高开发效率)
5. 方便后续扩展

#### 整体架构
![结构](./img/mindmap.png)

### plugin插件

采用了 发布-订阅观察者设计模式 以便后续迭代功能

```js
 watch 订阅消息
 notify 发布消息, 消息一发布, watch就能接收到并上报
```

**优势:**
1. 可以自定义引入插件,降低项目引入包体积
2. 黑盒模式, 开发人员无需知道代码实现逻辑, 只需按照已定的插件格式进行开发插件,方便拓展


**插件的思路**
![插件](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c9c6b46cb4c447487ac88ca6befc7bb~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

**栗子**

console-error监听

```js

const consoleErrorPlugin: BasePluginType<BrowserErrorTypes, BrowserClient> = {
    name: BrowserErrorTypes.CE,
    monitor(notify) { // 观察者模式, 
        (_global as unknown as Window & typeof globalThis).console.error = (...args: any[]) => {
            notify(BrowserErrorTypes.CE, args); // 将一阶段处理结果通过notify进行订阅
        };
    },
    transform(args: any[]) { // 参数格式转化,得到 最终格式的 上传数据
        const _reportData:ReportErrorData = {
            type: 'error',
            subType: BrowserErrorTypes.CE,
            pageURL: get_page_url(),
            extraData: {
                type: '',
                errorUid: get_error_uid(`console-error-${args[0]}`),
                msg: args.join(';'),
                meta: undefined,
                stackTrace: undefined
            }
        };
        return _reportData;
    },
    consumer(reportData: ReportErrorData) { // use 中 watch 进行消息发布, 观察者模式消费者进行消费
        this.report.send(reportData, true);
    }
};
```

### 自定义上报
> 用于自定义埋点上报

正常情况下, 都是插件已经定好模式进行数据监听, 监听到然后上报, 无法自定义的针对所需业务进行上报. 所以`SDK`就必须提供一个全局函数供使用者进行调用

**api**
```js
export interface ReportData {
    type: string; // 信息类型
    subType: string// 信息副类型
    pageURL: string; // 上报页面
    startTime?: number; // 上报时间
    extraData: Record<string, any>
}

log(data: ReportData, isImmediate)
```

**栗子**
```js
// main.js
import {init} from '@qmonitor/browser'
import {vuePlugin} from '@qmonitor/vue'

const {log} = init({
    url: 'xxx',
    appID: 'xxx'
}, [vuePlugin])

vue.prototype.$log = log
```

```js
// x.vue
<a @click = "log"> </a>
...
methods: {
    log() {
        this.$log({
            type: 'log',
            extraData: {
                msg: '自定义上报'
            }
        }, true)
    }
 }

```

### 数据上报
- 用户id
    - 用SDK生成，在每次上报之前都判断localstorage是否存在trackerId，有则随着错误信息一起发送，没有的话生成一个并设置到localstorage
- 上报方法
    - sendBeacon(主要用于将统计数据发送到 Web 服务器)
    - axios
    — image 方式
- 上报时机
    - 缓存上报数据，集齐目标个数(个数可在配置项配置)上传
    - 页面隐藏与关闭的前夕上报数据
    - 不能阻塞项目：
        - 不能使用异步：防止页面关闭或刷新时通讯被浏览器cancel
        - 使用 `requestIdleCallback/setTimeout` 延时上报
- 上报数据
    - 过滤重复的数据
        - 每分上报数据拥有独立的id, 当id重复时, 不记录上报数据  
- 上报格式
```js
interface ReportData{
    id: stirng; // uuid,
    appID: string; // 项目id
    appName?: string; // 项目名称
    userID?: string; // 用户ID
    networkInfo?:Record<string, any>; // 网络信息
    data: {
        type:  'performance' | 'error'; // 信息类型
        subType: string; // 信息副类型
        pageURL: stirng; // 上报页面
        startTime?: number; // 上报时间
        extraData: Record<string, any>; // 针对 某一项类型中的具体数据
    }
}