const hap = require('hap-nodejs');
const rpi = require('./rpi');
const controller = require('./controller');
const config = require('../config.json');
const packageJson = require('../package.json');

const { Accessory, AccessoryEventTypes, Categories, Characteristic, CharacteristicEventTypes, Service } = hap;

const uuid = hap.uuid.generate("rpi-garage-remote-homekit-" + config.pin);
const accessory = new Accessory("Garage Door", uuid);
const openerService = new Service.GarageDoorOpener("Garage Door Opener");
const currentState = openerService.getCharacteristic(Characteristic.CurrentDoorState);
const targetState = openerService.getCharacteristic(Characteristic.TargetDoorState);

let autocloseTimeout = null;
let actionTimeout = null;
let currentAction = Characteristic.CurrentDoorState.CLOSED;

const simulateOpenerAction = async (from, to) => {
    clearTimeout(actionTimeout);
    openerService.setCharacteristic(Characteristic.CurrentDoorState, currentAction = from);
    actionTimeout = setTimeout(() => {
        openerService.setCharacteristic(Characteristic.CurrentDoorState, currentAction = to);
    }, config.actionTime * 1000);
};

const open = async () => {
    await controller.open();
    await simulateOpenerAction(Characteristic.CurrentDoorState.OPENING, Characteristic.CurrentDoorState.OPEN);

    if (config.autoclose) {
        autocloseTimeout = setTimeout(() => {
            openerService.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
        }, config.autoclose * 1000);
    }
}

const close = async () => {
    await controller.close();
    await simulateOpenerAction(Characteristic.CurrentDoorState.CLOSING, Characteristic.CurrentDoorState.CLOSED);
};

accessory.on(AccessoryEventTypes.IDENTIFY, async (paired, callback) =>
    controller.identify().then(callback));

openerService.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);

targetState.on(CharacteristicEventTypes.SET, async (value, callback) => {
    clearTimeout(autocloseTimeout);
    if (value === Characteristic.TargetDoorState.OPEN) {
        await open();
    } else if (value === Characteristic.TargetDoorState.CLOSED) {
        await close();
    }
    callback();
});

currentState.on(CharacteristicEventTypes.GET, async callback => {
    await controller.status();
    callback(null, currentAction);
});

accessory.getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, rpi.manufacturer())
    .setCharacteristic(Characteristic.Model, rpi.model())
    .setCharacteristic(Characteristic.SerialNumber, rpi.serial())
    .setCharacteristic(Characteristic.FirmwareRevision, packageJson.version);

accessory.addService(openerService);

accessory.publish({
    username: config.mac,
    pincode: config.pin,
    port: config.port,
    category: Categories.GARAGE_DOOR_OPENER,
});
