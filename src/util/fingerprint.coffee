Fingerprint = require('fingerprint')

fingerprint = new Fingerprint(canvas: true, screen_resolution: true, ie_activex: true)

getFingerprint = -> fingerprint.get()

module.exports = {getFingerprint}
