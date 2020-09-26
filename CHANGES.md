# Local-Devices

All notable changes to this project will be documented here. The format is based
on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project
adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2020-09-25

### Added

- support passing ip ranges to the `find` api ([#24](https://github.com/DylanPiercey/local-devices/pull/24))

## [3.0.0] - 2019-10-29

### Changed

⚠ BREAKING CHANGES

- dropping Node v8 support because [end-of-life](https://github.com/nodejs/Release#release-schedule)
  [[#18](https://github.com/DylanPiercey/local-devices/pull/18)]

### Fixes

- increase `maxBuffer` of `cp.exec` to 10MB (1024*1024*10), fixes [#10](https://github.com/DylanPiercey/local-devices/issues/10)
- fix: add timeout options when exec arp ([#13](https://github.com/DylanPiercey/local-devices/pull/13))
- Fixed win32 parser for better windows support ([#9](https://github.com/DylanPiercey/local-devices/pull/9))
- validate ip address before executing command for 'find' ([#16](https://github.com/DylanPiercey/local-devices/pull/16))

## [2.0.0] - 2019-02-10

### Added

- Support for Raspberry Pi (Linux)
- Partial support for windows
- Jest test suite and tests for Linux and other platforms
- with Travis CI integration
  
### Changed

- fixed npm module versions in package.json
- fixed node version to v8.14.1
