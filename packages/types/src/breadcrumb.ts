import { BreadcrumbTypes, SeverityLevel } from '@qmonitor/enums';
import { ReportErrorData, ReportApiErrorData } from './report-data-type';

export interface BreadcrumbData {
    /**
     * 事件类型
     */
    type: BreadcrumbTypes,
    // string for click dom
    data: ReportErrorData['mainData'] | ReportApiErrorData['mainData'] | string | number | object,
    time?: number
    level: SeverityLevel
  }
