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

## 简介
web-monitor-sdk: 是一套前端监控sdk, 包括收集
1. 错误数据
2. 性能数据
3. 用户行为数据(未开发)
4. wx小程序支持(未开发)

## 架构
> 借鉴了 vue3 和 mitojs 的代码

### monorepo
采用了 monorepo(管理项目代码的一个方式，指在一个项目仓库 (repo) 中管理多个模块/包 (package)，不同于常见的每个模块建一个 repo)

monorepo的优势:
1. 可分模块打包、分模块发布(提高开发体验)
2. 代码结构清晰(降低耦合性，提高代码可读性)
3. 方便之引入需要使用的模块
4. 核心功能抽离, 封装 抽象类, 具体模块使用时继承(提高开发效率)

### plugin插件
**优势:**
1. 可以自定义引入插件,降低项目引入包体积
2. 黑盒模式, 开发人员无需知道代码实现逻辑, 只需按照已定的插件格式进行开发插件,方便拓展

**整体结构**
[结构](https://note.youdao.com/s/YCGN2Ohu)

**插件的思路**
![插件](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c9c6b46cb4c447487ac88ca6befc7bb~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp)

**栗子**
```js

const consoleErrorPlugin: BasePluginType<BrowserErrorTypes, BrowserClient> = {
    name: BrowserErrorTypes.CE,
    monitor(notify) { // 观察者模式, 
        (_global as unknown as Window & typeof globalThis).console.error = (...args: any[]) => {
            notify(BrowserErrorTypes.CE, args); // 将一阶段处理结果通过notify进行订阅
        };
    },
    transform(args: any[]) { // use 中 watch 进行消息发布
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
    consumer(reportData: ReportErrorData) { // use 中 watch 进行消息发布
        this.report.send(reportData, true);
    }
};
```


