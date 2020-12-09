const hap = require('hap-nodejs');
const onoff = require('onoff');

const { CurrentDoorState, TargetDoorState } = hap.Characteristic;

const open = async (autoclose = 0) => {

};

const close = async () => {

};

const status = async () => {
    return CurrentDoorState.CLOSED;
};
