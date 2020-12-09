const onoff = require('onoff');

const press = async () => {

};

const open = async (autoclose = 0) => {
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
