var ip = require('ip')
var os = require('os')
var net = require('net')
var cp = require('mz/child_process')
var servers = getServers()
var lock = {}

/**
 * Finds all local devices (ip and mac address) connectd to the current network.
 */
module.exports = function findLocalDevices (address) {
  var key = String(address)
  lock[key] =
    lock[key] ||
    (address
      ? pingServer(address).then(arpOne)
      : pingServers().then(arpAll)
    ).then(unlock(key))
  return lock[key]
}

/**
 * Gets the current list of possible servers in the local networks.
 * TODO: mock in tests
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
 * Pings and individual server to update the arp table.
 */
function pingServer (address) {
  return new Promise(function (resolve) {
    // https://stackoverflow.com/a/51986121/1238150
    const socket = new net.Socket()
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
function arpAll () {
  return cp.exec('arp -a').then(parseAll)
}

/**
 * Parses arp scan data into a useable collection.
 */
function parseAll (data) {
  if (!data || !data[0]) {
    return []
  }

  // detect OS
  const platform = process.platform
  if (platform.includes('linux')) {
    return parseLinux(data, true)
  }

  return data[0]
    .trim()
    .split('\n')
    .map(parseRow)
    .filter(Boolean)
}

/**
 * Reads the arp table for a single address.
 */
function arpOne (address) {
  return cp.exec('arp -n ' + address).then(parseOne)
}

/**
 * Parses a single row of arp data.
 */
function parseOne (data) {
  if (!data || !data[0]) {
    return
  }

  // detect OS
  const platform = process.platform
  if (platform.includes('linux')) {
    return parseLinux(data)
  }

  return parseRow(data[0])
}

/**
 * Parses each row in the arp table into { name, ip, mac } on MACOSX.
 */
function parseRow (row) {
  // Parse name.
  var nameStart = 0
  var nameEnd = row.indexOf('(') - 1
  var name = row.slice(nameStart, nameEnd)

  // Parse ip.
  var ipStart = nameEnd + 2
  var ipEnd = row.indexOf(')', ipStart)
  var ipAddress = row.slice(ipStart, ipEnd)
  // Only resolve external ips.
  if (!~servers.indexOf(ipAddress)) {
    return
  }

  // Parse mac
  var macStart = row.indexOf(' at ', ipEnd) + 4
  var macEnd = row.indexOf(' on ', macStart)
  var macAddress = row.slice(macStart, macEnd)
  // Ignore unresolved hosts.
  if (macAddress === '(incomplete)') {
    return
  }
  // Format for always 2 digits
  macAddress = macAddress
    .replace(/^.:/, '0$&')
    .replace(/:.(?=:|$)/g, ':0X$&')
    .replace(/X:/g, '')

  return {
    name: name,
    ip: ipAddress,
    mac: macAddress
  }
}

/**
 * Parses each row in the arp table into { name, ip, mac } on LINUX.
 */
function parseLinux (data, parseMultiple = false) {
  // partial inspired by https://github.com/goliatone/arpscan/blob/master/lib/arpscanner.js
  const out = []
  const rows = data.split('\n').slice(parseMultiple ? 0 : 1)

  // Parses each row in the arp table into { name, ip, mac }.
  rows.forEach(row => {
    if (row === '') {
      return
    }
    const chunk = row.split(' ').filter(Boolean)

    if (parseMultiple) {
      return out.push({
        name: chunk[0],
        ip: chunk[1].match(/\((.*)\)/)[1],
        mac: chunk[3]
      })
    }

    out.push({
      name: '?', // does not provide a device name
      ip: chunk[0],
      mac: chunk[2]
    })
  })

  return out
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
