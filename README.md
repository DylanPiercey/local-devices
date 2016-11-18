[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)


# Local Devices

Find all devices connected to the local network using `arp -a`.
Will ping broadcast addresses to ensure that the local arp table is up to date.

# Installation

#### Npm
```console
npm install local-devices
```

## Example
```javascript
import findLocalDevices from 'local-devices'

findLocalDevices().then(devices => {
  devices /*
  [ { name: '...',
      ip: '192.168.0.1',
      mac: '...' },
    { name: '?', ip: '192.168.0.10', mac: '...' },
    { name: '...',
      ip: '192.168.0.17',
      mac: '...' },
    { name: '...',
      ip: '192.168.0.21',
      mac: '...' },
    { name: '...',
      ip: '192.168.0.22',
      mac: '...' },
    { name: '?', ip: '192.168.0.254', mac: '...' },
    { name: '?', ip: '192.168.0.255', mac: '...' },
    { name: '?', ip: '224.0.0.251', mac: '...' },
    { name: '?', ip: '239.255.255.250', mac: '...' } ]
  */
})
```

---

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
