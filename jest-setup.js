/**
 * MOCKS
 */
const mockHosts = [
  '? (192.168.0.202) at 00:12:34:56:78:90 on en0 ifscope [ethernet]',
  '? (192.168.0.212) at 00:12:34:56:78:91 on en0 ifscope [ethernet]',
  '? (192.168.0.222) at 00:12:34:56:78:92 on en0 ifscope [ethernet]',
  '? (192.168.0.232) at 00:12:34:56:78:93 on en0 ifscope [ethernet]',
  '? (192.168.1.234) at 00:12:34:56:78:94 on en0 ifscope [ethernet]',
  // "special" cases (eg. unresolved hosts)
  '? (192.168.0.242) at (incomplete) on en0 ifscope [ethernet]', // host is in the list but incomplete
  '192.168.0.243 (192.168.0.243) -- no entry' // host has no entry in the arp table
]

const mockLinuxHosts = [
  '192.168.0.202 dev eth0 lladdr 00:12:34:56:78:90 REACHABLE',
  '192.168.0.212 dev eth0 lladdr 00:12:34:56:78:91 REACHABLE',
  '192.168.0.222 dev eth0 lladdr 00:12:34:56:78:92 REACHABLE',
  '192.168.0.232 dev eth0 lladdr 00:12:34:56:78:93 REACHABLE',
  '192.168.1.234 dev eth0 lladdr 00:12:34:56:78:94 REACHABLE',
  // "special" cases (eg. unresolved hosts)
  '192.168.0.242 dev eth0 INCOMPLETE',
  '192.168.0.243 (192.168.0.243) -- no entry' // host has no entry in the arp table
]

/* eslint-disable */
// NOTE: may not cover all test cases yet
const mockWinHosts = [
  '192.168.0.202	00-12-34-56-78-90	dynamic',
  '192.168.0.212	00-12-34-56-78-91	dynamic',
  '192.168.0.222	00-12-34-56-78-92	dynamic',
  '192.168.0.232	00-12-34-56-78-93	dynamic',
  '192.168.1.234	00-12-34-56-78-94	dynamic',
]
/* eslint-enable */

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
  if (command.includes('n s')) {
    // receive the ip address of the request and the mac address from the mocked hosts
    const ip = command.match(/ip (.*){1} (.*)/)[2]
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

function mockPrepareWin (command) {
  // first filter all special case examples from the mockHost list (eg. no entry)
  const workingHosts = mockWinHosts.filter(i => i.indexOf('no entry') < 0)
  /* eslint-disable-next-line */
  workingHosts.unshift('Internet Address	Physical Address	Type')
  let r = workingHosts.join('\n')

  if (command.includes('-n')) {
    // only for TESTS, win32 will return the manual text instead
    r = 'scanning a specific IP is not supported on Windows with local-devices'
  }
  return r
}

jest.mock('mz/child_process', () => ({
  exec: jest.fn(command => {
    var r = mockPrepareHosts(command)
    if (process.platform === 'linux') {
      r = mockPrepareLinuxHosts(command)
    } else if (process.platform === 'win32') {
      r = mockPrepareWin(command)
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

jest.mock('os', () => ({
  // example mock for darwin (MacOSX)
  networkInterfaces: jest.fn().mockReturnValue({
    lo0:
      [{
        address: '127.0.0.1',
        netmask: '255.0.0.0',
        family: 'IPv4',
        mac: '00:00:00:00:00:00',
        internal: true,
        cidr: '127.0.0.1/8'
      }],
    utun0:
      [{
        address: 'as12::d3f4:56j:k789:0l00',
        netmask: 'ffff:ffff:ffff:ffff::',
        family: 'IPv6',
        mac: '00:00:00:00:00:00',
        scopeid: 11,
        internal: false,
        cidr: 'as12::d3f4:56j:k789:0l00/64'
      }],
    en5:
      [{
        address: '192.168.0.200',
        netmask: '255.255.254.0',
        family: 'IPv4',
        mac: '00:12:34:56:78:99',
        internal: false,
        cidr: '192.168.0.0/23'
      }]
  })
}))
