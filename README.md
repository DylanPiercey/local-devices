# Local Devices

[![version][version-badge]][package]
[![MIT License][license-badge]][licence]
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]

[![Build Status][build-badge]][build]
[![Coverage Status][coverage-badge]][coverage]
[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]

Find all devices connected to the local network using `arp -a`.
This module also pings all possible ip's in the local network to build the arp table.

## Installation

### Npm

```console
npm install local-devices
```

### Example

```javascript
// Using a transpiler
import find from 'local-devices'
// Without using a transpiler
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
find({ address: '192.168.0.10' }).then(device => {
  device /*
  {
    name: '?',
    ip: '192.168.0.10',
    mac: '...'
  }
  */
})

// Find all devices within 192.168.0.1 to 192.168.0.25 range
find({ address: '192.168.0.1-192.168.0.25' }).then(devices => {
    devices /*
    [
      { name: '?', ip: '192.168.0.10', mac: '...' },
      { name: '...', ip: '192.168.0.17', mac: '...' },
      { name: '...', ip: '192.168.0.21', mac: '...' },
      { name: '...', ip: '192.168.0.22', mac: '...' }
    ]
    */
})

// Find all devices within /24 subnet range of 192.168.0.x
find({ address: '192.168.0.0/24' }).then(devices => {
    devices /*
    [
      { name: '?', ip: '192.168.0.10', mac: '...' },
      { name: '...', ip: '192.168.0.50', mac: '...' },
      { name: '...', ip: '192.168.0.155', mac: '...' },
      { name: '...', ip: '192.168.0.211', mac: '...' }
    ]
    */
})

// Find all devices without resolving host names (Uses 'arp -an') - this is more performant if hostnames are not needed 
// (This flag is ignored on Windows machines as 'arp -an' is not supported)
find({ skipNameResolution: true }).then(devices => {
    devices /*
    [
      { name: '?', ip: '192.168.0.10', mac: '...' },
      { name: '?', ip: '192.168.0.50', mac: '...' },
      { name: '?', ip: '192.168.0.155', mac: '...' },
      { name: '?', ip: '192.168.0.211', mac: '...' }
    ]
    */
})

// Find all devices, specifying your own path for the `arp` binary 
find({ arpPath: '/usr/sbin/arp' }).then(devices => {
    devices /*
    [
      { name: '?', ip: '192.168.0.10', mac: '...' },
      { name: '?', ip: '192.168.0.50', mac: '...' },
      { name: '?', ip: '192.168.0.155', mac: '...' },
      { name: '?', ip: '192.168.0.211', mac: '...' }
    ]
    */
})
```
```

## Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!

## Contributors

Thanks goes to these wonderful people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://twitter.com/dylan_piercey"><img src="https://avatars2.githubusercontent.com/u/4985201?v=4" width="100px;" alt="Dylan Piercey"/><br /><sub><b>Dylan Piercey</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/commits?author=DylanPiercey" title="Code">💻</a> <a href="#example-DylanPiercey" title="Examples">💡</a> <a href="#review-DylanPiercey" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/DylanPiercey/local-devices/commits?author=DylanPiercey" title="Documentation">📖</a> <a href="#ideas-DylanPiercey" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-DylanPiercey" title="Answering Questions">💬</a></td>
    <td align="center"><a href="http://twitter.com/natterstefan"><img src="https://avatars2.githubusercontent.com/u/1043668?v=4" width="100px;" alt="Stefan Natter"/><br /><sub><b>Stefan Natter</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/commits?author=natterstefan" title="Code">💻</a> <a href="https://github.com/DylanPiercey/local-devices/commits?author=natterstefan" title="Tests">⚠️</a> <a href="https://github.com/DylanPiercey/local-devices/issues?q=author%3Anatterstefan" title="Bug reports">🐛</a> <a href="https://github.com/DylanPiercey/local-devices/commits?author=natterstefan" title="Documentation">📖</a> <a href="#ideas-natterstefan" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/kounelios13"><img src="https://avatars3.githubusercontent.com/u/11466138?v=4" width="100px;" alt="kounelios13"/><br /><sub><b>kounelios13</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/issues?q=author%3Akounelios13" title="Bug reports">🐛</a> <a href="https://github.com/DylanPiercey/local-devices/commits?author=kounelios13" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/MarkusSuomi"><img src="https://avatars3.githubusercontent.com/u/5594334?v=4" width="100px;" alt="MarkusSuomi"/><br /><sub><b>MarkusSuomi</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/commits?author=MarkusSuomi" title="Code">💻</a></td>
    <td align="center"><a href="http://nolazybits.com"><img src="https://avatars1.githubusercontent.com/u/214998?v=4" width="100px;" alt="Xavier Martin"/><br /><sub><b>Xavier Martin</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/commits?author=nolazybits" title="Code">💻</a></td>
    <td align="center"><a href="https://me.howel52.com/"><img src="https://avatars0.githubusercontent.com/u/9854818?v=4" width="100px;" alt="howel52"/><br /><sub><b>howel52</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/commits?author=howel52" title="Code">💻</a> <a href="https://github.com/DylanPiercey/local-devices/issues?q=author%3Ahowel52" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/LucaSoldi"><img src="https://avatars0.githubusercontent.com/u/5584781?v=4" width="100px;" alt="LucaSoldi"/><br /><sub><b>LucaSoldi</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/commits?author=LucaSoldi" title="Code">💻</a> <a href="https://github.com/DylanPiercey/local-devices/issues?q=author%3ALucaSoldi" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Miosame"><img src="https://avatars1.githubusercontent.com/u/8201077?v=4" width="100px;" alt="Miosame"/><br /><sub><b>Miosame</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/commits?author=Miosame" title="Code">💻</a> <a href="https://github.com/DylanPiercey/local-devices/commits?author=Miosame" title="Documentation">📖</a> <a href="#example-Miosame" title="Examples">💡</a></td>
    <td align="center"><a href="https://timrogers.co.uk"><img src="https://avatars.githubusercontent.com/u/116134?v=4" width="100px;" alt="Tim Rogers"/><br /><sub><b>Tim Rogers</b></sub></a><br /><a href="https://github.com/DylanPiercey/local-devices/commits?author=timrogers" title="Code">💻</a> <a href="https://github.com/DylanPiercey/local-devices/commits?author=timrogers" title="Documentation">📖</a> <a href="https://github.com/DylanPiercey/local-devices/commits?author=timrogers" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind are welcome!

### How to add Contributors

Contributors can be added with the [all-contributors cli](https://allcontributors.org/docs/en/cli/installation).
The cli is already installed and can be [used like this](https://allcontributors.org/docs/en/bot/usage):

```bash
yarn all-contributors add <username> <emoji-keys>
```

## LICENCE

[MIT](LICENCE)

[package]: https://www.npmjs.com/package/local-devices
[licence]: https://github.com/DylanPiercey/local-devices/blob/master/LICENCE
[prs]: http://makeapullrequest.com
[github-watch]: https://github.com/DylanPiercey/local-devices/watchers
[github-star]: https://github.com/DylanPiercey/local-devices/stargazers
[github-watch-badge]: https://img.shields.io/github/watchers/DylanPiercey/local-devices.svg?style=social
[github-star-badge]: https://img.shields.io/github/stars/DylanPiercey/local-devices.svg?style=social
[version-badge]: https://img.shields.io/npm/v/local-devices.svg?style=flat-square
[license-badge]: https://img.shields.io/npm/l/local-devices.svg?style=flat-square
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors

[build-badge]: https://travis-ci.org/DylanPiercey/local-devices.svg?branch=master
[build]: https://travis-ci.org/DylanPiercey/local-devices
[coverage-badge]: https://coveralls.io/repos/github/DylanPiercey/local-devices/badge.svg?branch=master
[coverage]: https://coveralls.io/github/DylanPiercey/local-devices?branch=master
