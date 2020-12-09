const hap = require('hap-nodejs');
const rpi = require('./rpi');
const door = require('./door');
const config = require('./config.json');

const { Accessory, AccessoryEventTypes, Categories, Characteristic, CharacteristicEventTypes, Service } = hap;

const uuid = hap.uuid.generate("rpi-garage-remote-homekit-" + config.pin);
const accessory = new Accessory("Garage Door", uuid);
const openerService = new Service.GarageDoorOpener("Garage Door Opener");
const currentState = openerService.getCharacteristic(Characteristic.CurrentDoorState);
const targetState = openerService.getCharacteristic(Characteristic.TargetDoorState);

let actionTimeout = null;
let currentAction = Characteristic.CurrentDoorState.CLOSED;

const simulateOpenerAction = async (from, to) => {
    clearTimeout(actionTimeout);
    currentAction = from;
    openerService.setCharacteristic(Characteristic.CurrentDoorState, from);
    actionTimeout = setTimeout(() => {
        currentAction = to;
        openerService.setCharacteristic(Characteristic.CurrentDoorState, to);
    }, config.actionTime * 1000);
};

accessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, 'Raspberry Pi')
    .setCharacteristic(Characteristic.Model, rpi.model())
    .setCharacteristic(Characteristic.SerialNumber, rpi.serial())
    .setCharacteristic(Characteristic.FirmwareRevision, config.firmware);

accessory.on(AccessoryEventTypes.IDENTIFY, async (paired, callback) =>
    door.identify().then(callback));

openerService.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);

targetState.on(CharacteristicEventTypes.SET, async (value, callback) => {
    if (value === Characteristic.TargetDoorState.OPEN) {
        console.log('Opening');
    } else if (value === Characteristic.TargetDoorState.CLOSED) {
        console.log('Closing');
    }
    callback();
});

currentState.on(CharacteristicEventTypes.GET, async callback => {
    await door.status();
    callback(null, currentAction);
});

accessory.addService(openerService);

accessory.publish({
    username: config.mac,
    pincode: config.pin,
    port: config.port,
    category: Categories.GARAGE_DOOR_OPENER,
});
