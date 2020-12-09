const hap = require('hap-nodejs');
const rpi = require('./rpi');

const {Accessory, Categories, Characteristic, CharacteristicEventTypes, Service} = hap;

const accessoryUuid = hap.uuid.generate("rpi-garage-remote-homekit");
const accessory = new Accessory("RPi Garage Door", accessoryUuid);

accessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, 'Raspberry Pi')
    .setCharacteristic(Characteristic.Model, rpi.model())
    .setCharacteristic(Characteristic.SerialNumber, rpi.serial());

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
    username: "17:51:07:F4:BC:80",
    pincode: "678-90-000",
    port: 47129,
    category: Categories.GARAGE_DOOR_OPENER,
});
