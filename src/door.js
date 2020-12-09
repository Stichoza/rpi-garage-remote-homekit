const onoff = require('onoff');
const config = require('../config.json');

const gpio = {
    open: new onoff.Gpio(config.gpio.open, 'out'),
    close: new onoff.Gpio(config.gpio.close, 'out'),
    status: new onoff.Gpio(config.gpio.status, 'out')
};

const press = async (pin, length = 500) => {
    pin.writeSync(onoff.Gpio.HIGH);
    setTimeout(() => pin.writeSync(onoff.Gpio.LOW), length);
};

const triplePress = async (pin, length = 500) => {
    setTimeout(() => press(gpio.status, length), 1);
    setTimeout(() => press(gpio.status, length), length * 2);
    setTimeout(() => press(gpio.status, length), length * 4);
}

const open = async () => await triplePress(gpio.open);
const close = async () => await press(gpio.close);
const status = async () => await press(gpio.status, 200);
const identify = async () => await triplePress(gpio.status, 100);

module.exports = { open, close, status, identify };
