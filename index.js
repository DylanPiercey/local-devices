var ip = require('ip')
var os = require('os')
var net = require('net')
var cp = require('mz/child_process')
var servers = getServers()
var lock = null

/**
 * Finds all local devices (ip and mac address) connectd to the current network.
 */
module.exports = function findLocalDevices () {
  lock = lock || pingServers()
    .then(scanARP)
    .then(parseTable)
    .then(unlock)
  return lock
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

    function close (err) {
      this.destroy(err)
      resolve()
    }
  })
}

/**
 * Reads the arp table.
 */
function scanARP () {
  return cp.exec('arp -a')
}

/**
 * Parses arp scan data into a useable collection.
 */
function parseTable (data) {
  if (!data || !data[0]) return []
  return data[0]
    .trim()
    .split('\n')
    .map(parseRow)
    .filter(Boolean)
}

/**
 * Parses each row in the arp table into { name, mac, ip }.
 */
function parseRow (row) {
  var macStart = row.indexOf(' at ') + 4
  var macEnd = row.indexOf(' on ')
  var nameStart = 0
  var nameEnd = row.indexOf('(') - 1
  var ipStart = nameEnd + 2
  var ipEnd = row.indexOf(')')
  var macAddress = row.slice(macStart, macEnd)
  var ipAddress = row.slice(ipStart, ipEnd)
  var name = row.slice(nameStart, nameEnd)

  // Ignore unresolved hosts.
  if (macAddress === '(incomplete)') return
  // Only resolve external ips.
  if (!~servers.indexOf(ipAddress)) return

  return {
    name: name,
    mac: macAddress,
    ip: ipAddress
  }
}

/**
 * Clears the current promise and unlocks (will ping servers again).
 */
function unlock (data) {
  lock = null
  return data
}
