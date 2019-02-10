# Local Devices

[![version][version-badge]][package]
[![MIT License][license-badge]][licence]
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors)
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

## Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!

## Contributors

Thanks goes to these wonderful people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore -->
| [<img src="https://avatars.githubusercontent.com/u/4985201?v=3" width="100px;"/><br /><sub><b>Dylan Piercey</b></sub>](https://github.com/DylanPiercey)<br />[💬](#question-local-devices "Answering Questions") [💻](https://github.com/DylanPiercey/local-devices/commits?author=DylanPiercey "Code") [📖](https://github.com/DylanPiercey/local-devices/commits?author=DylanPiercey "Documentation") [💡](#ideas-planning-local-devices "Examples") [🤔](#ideas-planning-local-devices "Ideas & Planning") [👀](#review-local-devices "Reviewed Pull Requests") | [<img src="https://avatars.githubusercontent.com/u/1043668?v=3" width="100px;"/><br /><sub><b>Stefan Natter</b></sub>](https://github.com/natterstefan)<br />[🐛](https://github.com/DylanPiercey/local-devices/issues?q=author%3Anatterstefan "Bug Reports") [💻](https://github.com/DylanPiercey/local-devices/commits?author=natterstefan "Code") [📖](https://github.com/DylanPiercey/local-devices/commits?author=natterstefan "Documentation") [🤔](#ideas-planning-local-devices "Ideas & Planning") [⚠️](https://github.com/DylanPiercey/local-devices/commits?author=natterstefan "Tests") | [<img src="https://avatars.githubusercontent.com/u/11466138?v=3" width="100px;"/><br /><sub><b>kounelios13</b></sub>](https://github.com/kounelios13)<br />[🐛](https://github.com/DylanPiercey/local-devices/issues?q=author%3Anatterstefan "Bug Reports") [📖](https://github.com/DylanPiercey/local-devices/commits?author=kounelios13 "Documentation") | [<img src="https://avatars.githubusercontent.com/u/2037007?v=3" width="100px;"/><br /><sub><b>Markus Suomi</b></sub>](https://github.com/MarkusSuomi)<br />[💻](https://github.com/DylanPiercey/local-devices/commits?author=MarkusSuomi "Code") | [<img src="https://avatars.githubusercontent.com/u/214998?v=3" width="100px;"/><br /><sub><b>Xavier Martin</b></sub>](https://github.com/nolazybits)<br />[💻](https://github.com/DylanPiercey/local-devices/commits?author=nolazybits "Code") |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind are welcome!

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

[build-badge]: https://api.travis-ci.org/dylanpiercey/local-devices.svg?branch=master
[build]: https://travis-ci.org/dylanpiercey/local-devices
[coverage-badge]: https://coveralls.io/repos/github/dylanpiercey/local-devices/badge.svg?branch=master
[coverage]: https://coveralls.io/github/dylanpiercey/local-devices?branch=master