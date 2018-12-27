/**
 * Parses each row in the arp table into { name, ip, mac }.
 */
module.exports = function parseRow (row, servers) {
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
