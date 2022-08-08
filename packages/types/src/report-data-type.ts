export interface ReportData {
    type: string; // 信息类型
    subType: string// 信息副类型
    pageURL: string; // 上报页面
    startTime?: number; // 上报时间
    extraData: Record<string, any>
}
export interface ReportBaseInfo {
    id: string; // uuid,
    appID: string; // 项目id
    appName?: string; // 项目名称
    userID?: string; // 用户ID
    networkInfo?:Record<string, any> // 网络信息
    data: ReportData
}

// web 错误数据
export interface ReportErrorData<T extends string = any > extends ReportData {
    type: 'error'; // 信息类型
    subType: T// 信息副类型
    pageURL: string; // 上报页面
    startTime?: number; // 上报时间
    extraData: {
        type: string;
        errorUid: string;
        msg: string;
        meta: Record<string, any>;
        stackTrace: Record<'frames', string[]>;
    }
}
export interface ReportPerformanceData<T extends string = any > extends ReportData {
    type: 'performance'; // 信息类型
    subType: T// 信息副类型
    pageURL: string; // 上报页面
    extraData: Record<string, any>
}
export interface ReportBehaviorData<T extends string = any > extends ReportData {
    type: 'behavior'; // 信息类型
    subType: T// 信息副类型
    pageURL: string; // 上报页面
    extraData: Record<string, any>
}
