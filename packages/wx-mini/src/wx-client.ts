import { BaseClient, BaseReport } from '@qmonitor/core';
import { MonitorClassTypes, MonitorTypes } from '@qmonitor/enums';
import { BaseOptionsType } from '@qmonitor/types';
import { first_str_to_uppercase, format_string } from '@qmonitor/utils';
import { wxOptionsTypes } from './types';

export class wxClient extends BaseClient<wxOptionsTypes, MonitorTypes> {
    report: BaseReport<BaseOptionsType>;
    constructor(options: wxOptionsTypes) {
        super(options);
    }
    isPluginEnable(name: MonitorTypes): boolean {
        const _flag = `disabled${format_string(name)}`;
        return !this.options[_flag];
    }
    isPluginsEnable(type: MonitorClassTypes): boolean {
        const _flag = `disabled${first_str_to_uppercase(type)}`;
        return !this.options[_flag];
    }
}
