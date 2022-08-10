import { ReportBaseInfo } from './report-data-type';
import { VueInstance } from './vue-types';

type CANCEL = null | undefined | boolean

type TSetRequestHeader = (key: string, value: string) => {}
export interface IBeforeAppAjaxSendConfig {
  setRequestHeader: TSetRequestHeader
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS'

interface IRequestHeaderConfig {
  url: string
  method: HttpMethod
}

export interface BaseOptionsFieldsType { // 基本属性
    url?: string; // 上报地址
    appID?: string; // 项目ID
    appName?: string; // 项目名称
    userID?: string; // 用户ID
    cacheNum?:number; // 缓存数据
    sample?: number; // 采样率
    vue?: VueInstance
}

export interface BaseOptionsHooksType { // 自定义钩子
    /**
     * 钩子函数:在每次发送事件前会调用, 可自定义对请求参数进行设置
     *
     * @param {ReportBaseInfo} event 上报的数据格式
     * @return {*}  {(Promise<TransportDataType | null | CANCEL> | TransportDataType | any | CANCEL | null)} 如果返回 null | undefined | boolean 时，将忽略本次上传
     * @memberof BaseOptionsHooksType
    */
    beforeDataReport?(event: ReportBaseInfo):Promise<ReportBaseInfo | CANCEL> | ReportBaseInfo | any | CANCEL
    /**
     * 钩子函数:拦截用户页面的ajax请求，并在ajax请求发送前执行该hook，可以对用户发送的ajax请求做xhr.setRequestHeader
     *
     * @param {IRequestHeaderConfig} config 原本的请求头信息
     * @param {IBeforeAppAjaxSendConfig} setRequestHeader 设置请求头函数
     * @memberof BaseOptionsHooksType
     */
    beforeAppAjaxSend?(config: IRequestHeaderConfig, setRequestHeader: IBeforeAppAjaxSendConfig): void

}
export type BaseOptionsType = BaseOptionsFieldsType & BaseOptionsHooksType
