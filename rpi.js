const fs = require('fs');

const serialFile = '/sys/firmware/devicetree/base/serial-number';
const modelFile = '/sys/firmware/devicetree/base/model';

const readFile = (file, caps = false, fallback = 'Unknown') => {
    let content = fallback;

    try {
        content = fs.readFileSync(file);
    } catch (e) {
        return fallback;
    }

    return caps ? content.toUpperCase() : content;
}

module.exports = {
    manufacturer: () => 'Raspberry Pi',
    model: () => readFile(modelFile),
    serial: () => readFile(serialFile, true)
};
