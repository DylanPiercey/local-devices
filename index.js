var ip = require('ip')
var os = require('os')
var cp = require('mz/child_process')
var dgram = require('dgram')
var message = Buffer.from('ping')
var servers = getServers()
var connection = null

/**
 * Finds all local devices (ip and mac address) connectd to the current network.
 */
module.exports = function findLocalDevices () {
  return getConnection()
    .then(pingServers)
    .then(scanARP)
    .then(parseTable)
}

/**
 * Gets the current list of dns broadcast servers.
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
        result.push(subnet.broadcastAddress)
      }
    }
  }

  return result
}

/**
 * Connects to the dns broadcast server (reuses connection if possible).
 */
function getConnection () {
  connection = connection || new Promise(function (resolve, reject) {
    var connected = false
    dgram
      .createSocket('udp4')
      .bind()
      .unref()
      .once('error', function error (err) {
        if (!connected) return reject(err)
        connection = getConnection()
      })
      .once('listening', function listening () {
        connected = true
        this.setBroadcast(true)
        resolve(this)
      })
  })

  return connection
}

/**
 * Sends a ping to all dns servers to update the arp table.
 */
function pingServers (client) {
  return Promise.all(servers.map(pingServer))

  /**
   * Pings and individual dns broadcast server.
   */
  function pingServer (address) {
    return new Promise(function (resolve, reject) {
      return client.send(message, 0, message.length, 41234, address, function (err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

/**
 * Does an arp scan of the current network.
 */
function scanARP () {
  return cp.exec('arp -a')
}

/**
 * Parses arp scan data into a useable collection.
 */
function parseTable (data) {
  if (!data || !data[0]) return []
  var table = data[0]
  var result = table.trim().split('\n')

  for (var i = result.length; i--;) {
    var row = result[i]
    var nameStart = 0
    var nameEnd = row.indexOf('(') - 1
    var ipStart = nameEnd + 2
    var ipEnd = row.indexOf(')')
    var macStart = row.indexOf(' at ') + 4
    var macEnd = row.indexOf(' on ')

    result[i] = {
      name: row.slice(nameStart, nameEnd),
      ip: row.slice(ipStart, ipEnd),
      mac: row.slice(macStart, macEnd)
    }
  }

  return result
}
