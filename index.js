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
  lock[key] = lock[key] || (address
    ? pingServer(address).then(arpOne)
    : pingServers().then(arpAll)
  ).then(unlock(key))
  return lock[key]
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
 * Pings and individual server to update the arp table.
 */
function pingServer (address) {
  return new Promise(function (resolve, reject) {
    new net.Socket()
      .setTimeout(1000, close)
      .connect(80, address, close)
      .once('error', close)

    function close () {
      this.destroy()
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
  if (!data || !data[0]) return []
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
  if (!data || !data[0]) return
  return parseRow(data[0])
}

/**
 * Parses each row in the arp table into { name, mac, ip }.
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
  if (!~servers.indexOf(ipAddress)) return

  // Parse mac
  var macStart = row.indexOf(' at ', ipEnd) + 4
  var macEnd = row.indexOf(' on ', macStart)
  var macAddress = row.slice(macStart, macEnd)
  // Ignore unresolved hosts.
  if (macAddress === '(incomplete)') return
  // Format for always 2 digits
  macAddress = macAddress.replace(/^.:/, '0$&')
    .replace(/:.(?=:|$)/g, ':0X$&')
    .replace(/X:/g, '');

  return {
    name: name,
    ip: ipAddress,
    mac: macAddress
  }
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
