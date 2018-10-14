[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


# Local Devices

Find all devices connected to the local network using `arp -a`.
This module also pings all possible ip's in the local network to build the arp table.

# Installation

#### Npm
```console
npm install local-devices
```

## Example
```javascript
//  Using a transpiler
import find from 'local-devices'
//  Without using a transpiler
const find = require('local-devices');
// Find all local network devices.
find().then(devices => {
  devices /*
  [
    { name: '?', ip: '192.168.0.10', mac: '...' },
    { name: '...', ip: '192.168.0.17', mac: '...' },
    { name: '...', ip: '192.168.0.21', mac: '...' },
    { name: '...', ip: '192.168.0.22', mac: '...' }
  ]
  */
})

// Find a single device by ip address.
find('192.168.0.10').then(device => {
  device /*
  {
    name: '?',
    ip: '192.168.0.10',
    mac: '...'
  }
  */
})
```

---

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
