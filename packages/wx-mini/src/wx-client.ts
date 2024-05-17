import { BaseClient, BaseReport } from '@qmonitor/core';
import { MonitorClassTypes, MonitorTypes } from '@qmonitor/enums';
import { BaseOptionsType } from '@qmonitor/types';
import { firstStrToUppercase, formatString } from '@qmonitor/utils';
import { wxOptionsTypes } from './types';

export class wxClient extends BaseClient<wxOptionsTypes, MonitorTypes> {
    report: BaseReport<BaseOptionsType>;
    constructor(options: wxOptionsTypes) {
        super(options);
    }
    isPluginEnable(name: MonitorTypes): boolean {
        const _flag = `disabled${formatString(name)}`;
        return !this.options[_flag];
    }
    isPluginsEnable(type: MonitorClassTypes): boolean {
        const _flag = `disabled${firstStrToUppercase(type)}`;
        return !this.options[_flag];
    }
}
