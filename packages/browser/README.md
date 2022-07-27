# `browser`

> TODO: description

## Usage

```bash
npm install @qmonitor/browser
```

```js

import { init } from '@qmonitor/browser';

init({
    url: 'http://localhost:8083/reportData',
    appName: '七猫',
    appID: 'qimao',
    cacheNum: 10,
    vue: {
        Vue,
        router
    }
});
```

## api
```js
{   
    url?: string; // 上报地址
    appID?: string; // 项目ID
    appName?: string; // 项目名称
    userID?: string; // 用户ID
    cacheNum?:number; // 缓存数据
    sample?: number; // 采样率
    vue?: { // vue项目需要
        Vue?: VueInstance,
        router?: VueRouter
    }
    disabledConsoleError?: boolean; // 是否禁止监控 控制台错误, 默认是true
    disabledJsError?: boolean; // 是否禁止监控 JsError, 默认是true
    disabledPromiseError?: boolean; // 是否禁止监控  PromiseError, 默认是true
    disabledResourceError?: boolean; // 是否禁止监控  资源加载错误, 默认是true
    disabledFirstPaint?: boolean; // 是否禁止监控 首次绘制, 默认是true
    disabledFirstContentfulPaint?: boolean; // 是否禁止监控 首次有效绘制, 默认是true
    disabledLargestContentfulPaint?: boolean; // 是否禁止监控 最大内容绘制, 默认是true
    disabledFirstInputDelay?: boolean; // 是否禁止监控  首次输入延迟, 默认是true
    disabledCumulativeLayoutShift?: boolean; // 是否禁止监控 绘画偏移分数, 默认是true
    disabledNavigation?: boolean; // 是否禁止监控 页面关键时间点, 默认是true
    disabledResource?: boolean; // 是否禁止监控 资源文件, 默认是true
    disabledFetch?: boolean; // 是否禁止监控 api, 默认是true
    disabledXhr?: boolean; // 是否禁止监控 api, 默认是true
    disabledFirstMeaningPaint? : boolean; // 是否禁止监控 首次有效绘制, 默认是true
    // 钩子方法
    configReportXhr?(xhr: XMLHttpRequest, reportData: any): void // 钩子函数，配置发送到服务端的xhr, 一般浏览器使用beacon, 所以用不到
    beforeDataReport?(event: ReportBaseInfo):Promise<ReportBaseInfo | CANCEL> | ReportBaseInfo | any | CANCEL // 在每次发送事件前会调用, 可自定义对上传数据进行更改
    beforeAppAjaxSend?(config: IRequestHeaderConfig, setRequestHeader: IBeforeAppAjaxSendConfig): void // 拦截用户页面的ajax请求，并在ajax请求发送前执行该hook
}
```
