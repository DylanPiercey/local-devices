var ip = require('ip')
var os = require('os')
var net = require('net')
var cp = require('mz/child_process')
var getIPRange = require('get-ip-range')

var parseLinux = require('./parser/linux')
var parseWin32 = require('./parser/win32')
var parseRow = require('./parser')

var servers
var lock = {}

const TEN_MEGA_BYTE = 1024 * 1024 * 10
const ONE_MINUTE = 60 * 1000
const options = {
  maxBuffer: TEN_MEGA_BYTE,
  timeout: ONE_MINUTE
}

/**
 * Finds all local devices (ip and mac address) connected to the current network.
 */
module.exports = function findLocalDevices ({ address = '', skipNameResolution = false, arpPath = 'arp' } = {}) {
  var key = String(address)

  if (isRange(address)) {
    try {
      servers = getIPRange(key)
    } catch (error) {
      // Note: currently doesn't throw the intended error message from the package maintainer
      // It will still be caught, PR here though: https://github.com/JoeScho/get-ip-range/pull/6
      return error
    }
  } else {
    servers = getServers()
  }

  if (!lock[key]) {
    if (!address || isRange(key)) {
      lock[key] = pingServers().then(() => arpAll(skipNameResolution, arpPath)).then(unlock(key))
    } else {
      lock[key] = pingServer(address).then(address => arpOne(address, arpPath)).then(unlock(key))
    }
  }

  return lock[key]
}

function isRange (address) {
  return address && new RegExp('/|-').test(address)
}

/**
 * Gets the current list of possible servers in the local networks.
 */
function getServers () {
  var interfaces = os.networkInterfaces()
  var result = []

  for (var key in interfaces) {
    var addresses = interfaces[key]
    for (var i = addresses.length; i--;) {
      var address = addresses[i]
      if (address.family === 'IPv4' && !address.internal) {
        var subnet = ip.subnet(address.address, address.netmask)
        var current = ip.toLong(subnet.firstAddress)
        var last = ip.toLong(subnet.lastAddress) - 1
        while (current++ < last) result.push(ip.fromLong(current))
      }
    }
  }

  return result
}

/**
 * Sends a ping to all servers to update the arp table.
 */
function pingServers () {
  return Promise.all(servers.map(pingServer))
}

/**
 * Pings an individual server to update the arp table.
 */
function pingServer (address) {
  return new Promise(function (resolve) {
    var socket = new net.Socket()
    socket.setTimeout(1000, close)
    socket.connect(80, address, close)
    socket.once('error', close)

    function close () {
      socket.destroy()
      resolve(address)
    }
  })
}

/**
 * Reads the arp table.
 */
function arpAll (skipNameResolution = false, arpPath) {
  const isWindows = process.platform.includes('win32')
  const cmd = (skipNameResolution && !isWindows) ? `${arpPath} -an` : `${arpPath} -a`
  return cp.exec(cmd, options).then(parseAll)
}

/**
 * Parses arp scan data into a useable collection.
 */
function parseAll (data) {
  if (!data || !data[0]) {
    return []
  }

  if (process.platform.includes('linux')) {
    var rows = data[0].split('\n')
    return rows.map(function (row) {
      return parseLinux(row, servers)
    }).filter(Boolean)
  } else if (process.platform.includes('win32')) {
    var winRows = data[0].split('\n').splice(1)
    return winRows.map(function (row) {
      return parseWin32(row, servers)
    }).filter(Boolean)
  }

  return data[0]
    .trim()
    .split('\n')
    .map(function (row) {
      return parseRow(row, servers)
    })
    .filter(Boolean)
}

/**
 * Reads the arp table for a single address.
 */
function arpOne (address, arpPath) {
  if (!ip.isV4Format(address) && !ip.isV6Format(address)) {
    return Promise.reject(new Error('Invalid IP address provided.'))
  }

  return cp.exec(`${arpPath} -n ${address}`, options).then(parseOne)
}

/**
 * Parses a single row of arp data.
 */
function parseOne (data) {
  if (!data || !data[0]) {
    return
  }

  if (process.platform.includes('linux')) {
    // ignore unresolved hosts (can happen when parseOne returns only one unresolved host)
    if (data[0].indexOf('no entry') >= 0) {
      return
    }

    // remove first row (containing "headlines")
    var rows = data[0].split('\n').slice(1)[0]
    return parseLinux(rows, servers, true)
  } else if (process.platform.includes('win32')) {
    return // currently not supported
  }

  return parseRow(data[0], servers)
}

/**
 * Clears the current promise and unlocks (will ping servers again).
 */
function unlock (key) {
  return function (data) {
    lock[key] = null
    return data
  }
}
