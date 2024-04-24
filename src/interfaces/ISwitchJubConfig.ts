import { IDummySwitch } from './IDummySwitch';

export interface ISwitchJubConfig {
    platform: string;
    switches: IDummySwitch[];
    apiToken: string;
}