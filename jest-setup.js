/**
 * MOCKS
 */
const mockHosts = [
  '? (192.168.0.202) at 00:12:34:56:78:90 on en0 ifscope [ethernet]',
  '? (192.168.0.212) at 00:12:34:56:78:91 on en0 ifscope [ethernet]',
  '? (192.168.0.222) at 00:12:34:56:78:92 on en0 ifscope [ethernet]',
  '? (192.168.0.232) at 00:12:34:56:78:93 on en0 ifscope [ethernet]',
  // "special" cases (eg. unresolved hosts)
  '? (192.168.0.242) at (incomplete) on en0 ifscope [ethernet]', // host is in the list but incomplete
  '192.168.0.243 (192.168.0.243) -- no entry' // host has no entry in the arp table
]

const mockLinuxHosts = [
  '? (192.168.0.202) at 00:12:34:56:78:90 [ether] on eth0',
  '? (192.168.0.212) at 00:12:34:56:78:91 [ether] on eth0',
  '? (192.168.0.222) at 00:12:34:56:78:92 [ether] on eth0',
  '? (192.168.0.232) at 00:12:34:56:78:93 [ether] on eth0',
  // "special" cases (eg. unresolved hosts)
  '? (192.168.0.242) at <incomplete> on eth0',
  '192.168.0.243 (192.168.0.243) -- no entry' // host has no entry in the arp table
]

function mockPrepareHosts (command) {
  // first filter all special case examples from the mockHost list (eg. no entry)
  const workingHosts = mockHosts.filter(i => i.indexOf('no entry') < 0)
  let r = workingHosts.join('\n')

  if (command.includes('-n')) {
    const ip = command.match(/arp -(.*){1} (.*)/)[2]
    r = mockHosts.find(i => i.indexOf(ip) > 0)
  }

  return r
}

function mockPrepareLinuxHosts (command) {
  // first filter all special case examples from the mockHost list (eg. no entry)
  const workingHosts = mockLinuxHosts.filter(i => i.indexOf('no entry') < 0)
  let r = workingHosts.join('\n')

  // then define the current use-case (arp all or arp one)
  if (command.includes('-n')) {
    // receive the ip address of the request and the mac address from the mocked hosts
    const ip = command.match(/arp -(.*){1} (.*)/)[2]
    const host = mockLinuxHosts.find(i => i.indexOf(ip) >= 0)

    // and finally prepare the arp output for the tests
    if (host.indexOf('no entry') >= 0) {
      r = host
    } else {
      const macAddress = host.split(' ')[3]
      r = `Address                  HWtype  HWaddress           Flags Mask            Iface
${ip}             ether   ${macAddress}   C                     eth0`
    }
  }

  return r
}

jest.mock('mz/child_process', () => ({
  exec: jest.fn(command => {
    var r = mockPrepareHosts(command)
    if (process.platform === 'linux') {
      r = mockPrepareLinuxHosts(command)
    }
    return new Promise(resolve => resolve([r]))
  })
}))

// Mock net.Socket (Alternative (not tested yet): https://www.npmjs.com/package/mitm)
jest.mock('net', () => ({
  Socket: jest.fn(() => ({
    setTimeout: jest.fn((timeout, cb) => {
      cb()
    }),
    destroy: jest.fn(),
    connect: jest.fn((port, address, cb) => {
      cb()
    }),
    once: jest.fn((timeout, cb) => {
      cb()
    })
  }))
}))
