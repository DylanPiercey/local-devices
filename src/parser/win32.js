/**
 * Parses each row in the arp table into { name, ip, mac } on win32.
 */
module.exports = function parseRow (row, servers) {
  var chunks = row.split('\t')

  // Parse name.
  var ipAddress = chunks[0]
  // Only resolve external ips.
  if (!~servers.indexOf(ipAddress)) {
    return
  }

  // Parse mac
  var macAddress = chunks[1].replace(/-/g, ':')
  // Ignore unresolved hosts.
  if (macAddress === '(incomplete)') {
    return
  }

  return {
    name: '?', // unresolved
    ip: ipAddress,
    mac: macAddress
  }
}
