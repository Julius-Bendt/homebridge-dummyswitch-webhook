import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SwitchPlatformAccessory } from './SwitchPlatformAccessory';
import { ISwitchJubConfig } from './interfaces/ISwitchJubConfig';
import { IDummySwitch } from './interfaces/IDummySwitch';


export class SwitchHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public readonly switchConfig: ISwitchJubConfig;


  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {

    this.switchConfig = this.validateConfig(this.config, this.log);

    if (this.switchConfig === null) {
      this.log.error('Please fix any configuration errors before continuing. Plugin will not be started until then');
      return;
    }

    // run the method to discover / register your devices as accessories
    this.api.on('didFinishLaunching', () => {
      this.discoverDevices(config, log);
    });

  }

  configureAccessory(accessory: PlatformAccessory) {

    this.log.debug('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  discoverDevices(config, log) {
    const usedUuids: string[] = [];

    for (const dummySwitch of this.switchConfig.switches) {

      const uuid = this.api.hap.uuid.generate(dummySwitch.name);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        usedUuids.push(uuid);

        log.debug('Restoring existing dummy switch accessory from cache:', existingAccessory.displayName);
        new SwitchPlatformAccessory(this, existingAccessory, dummySwitch);
        continue;
      }

      // the accessory does not yet exist, so we need to create it
      log.debug('Adding dummy switch accessory:', dummySwitch.name);

      // create a new accessory
      const accessory = new this.api.platformAccessory(dummySwitch.name, uuid);
      usedUuids.push(uuid);
      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context.device = {
        name: dummySwitch.name,
        uuid: uuid,
      };

      new SwitchPlatformAccessory(this, accessory, dummySwitch);

      // link the accessory to your platform
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }

    const unusedAccessories = this.accessories.filter((accessory) => !usedUuids.includes(accessory.UUID));
    unusedAccessories.forEach((accessory) => {
      log.debug(`Removing unused accessory ${accessory.displayName}`);
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    });

  }

  validateConfig(config, log: Logger): ISwitchJubConfig {

    // forEach included in case more configs come in the future
    ['platform'].forEach((required: string) => {

      if (!config[required]) {
        log.error(`Please configure ${PLATFORM_NAME} correctly. Missing key '${required}'`);
        return null;
      }

    });

    const switches: Array<IDummySwitch> = [];
    this.config.switches?.forEach(device => {

      if (device.name == undefined || device.webhook == undefined) {
        this.log.error('switch  is missing required keys! Will skip for now', device);
        return; //Continue equivalent
      }

      switches.push({
        name: device.name,
        webhook: device.webhook,
      });
    });

    return {
      platform: config.platform,
      switches: switches,
      apiToken: config?.apiToken ?? '',
    };
  }


}
