const hap = require('hap-nodejs');
const rpi = require('./rpi');
const door = require('./door');
const config = require('./config.json');

const { Accessory, AccessoryEventTypes, Categories, Characteristic, CharacteristicEventTypes, Service } = hap;

const accessory = new Accessory("RPi Garage Door", accessoryUuid);
const uuid = hap.uuid.generate("rpi-garage-remote-homekit-" + config.pin);

accessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, 'Raspberry Pi')
    .setCharacteristic(Characteristic.Model, rpi.model())
    .setCharacteristic(Characteristic.SerialNumber, rpi.serial())
    .setCharacteristic(Characteristic.FirmwareRevision, config.firmware);

accessory.on('identify', (paired, callback) => {
    console.log('Identifying');

    callback();
});

const openerService = new Service.GarageDoorOpener("Garage Door Opener");

const currentState = openerService.getCharacteristic(Characteristic.CurrentDoorState);
const targetState = openerService.getCharacteristic(Characteristic.TargetDoorState);

targetState.on(CharacteristicEventTypes.SET, (value, callback) => {
    if (value === Characteristic.TargetDoorState.OPEN) {
        console.log('Opening');
    } else if (value === Characteristic.TargetDoorState.CLOSED) {
        console.log('Closing');
    }
    callback();
});

currentState.on(CharacteristicEventTypes.GET, callback => {
    console.log('Checking');
    callback(null, Characteristic.CurrentDoorState.CLOSED);
});

accessory.addService(openerService);

accessory.publish({
    username: config.mac,
    pincode: config.pin,
    port: config.port,
    category: Categories.GARAGE_DOOR_OPENER,
});
