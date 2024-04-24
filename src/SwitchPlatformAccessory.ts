import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { SwitchHomebridgePlatform } from './SwitchHomebridgePlatform';
import { createAxios } from './services/http';
import { IDummySwitch } from './interfaces/IDummySwitch';

export class SwitchPlatformAccessory {
  private service: Service;
  private readonly axios;

  private states = {
    on: false,
  };

  constructor(
    private readonly platform: SwitchHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly switchConfig: IDummySwitch,
  ) {

    // Setup axios, which will communicate with Switch
    this.axios = createAxios(switchConfig.webhook, platform.switchConfig.apiToken ?? '', this.platform.log);

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'JUB')
      .setCharacteristic(this.platform.Characteristic.Model, 'Jub dummy switches')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');


    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    this.service.setCharacteristic(this.platform.Characteristic.Name, this.switchConfig.name);

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));
  }


  async setOn(value: CharacteristicValue) {
    this.states.on = value as boolean;

    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .updateValue(this.states.on);

    await this.axios.post('/', {
      'name': this.switchConfig.name,
      'value': this.states.on,
      'valueType': 'SWITCH',
    });

  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.states.on;

    return isOn;
  }
}
