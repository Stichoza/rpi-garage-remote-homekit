const onoff = require('onoff');
const config = require('./config.json');

const gpio = {
    open: new onoff.Gpio(config.gpio.open, 'out'),
    close: new onoff.Gpio(config.gpio.close, 'out'),
    status: new onoff.Gpio(config.gpio.status, 'out')
};

const press = async (pin, length = 500) => {
    pin.write(onoff.Gpio.HIGH);
    setTimeout(pin.write(onoff.Gpio.LOW), length);
};

const open = async () => {
    console.log('Green blink');
};

const close = async () => {
    console.log('Red blink');
};

const status = async () => {
    console.log('Blue blink');
};

const identify = async () => {
    console.log('Blue blink-blink-blink');
};

module.exports = { open, close, status, identify };
