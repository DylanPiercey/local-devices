const find = require('../src/index')

const mockHosts = [
  '? (192.168.0.202) at 00:12:34:56:78:90 [ether] on eth0',
  '? (192.168.0.212) at 00:12:34:56:78:91 [ether] on eth0',
  '? (192.168.0.222) at 00:12:34:56:78:92 [ether] on eth0',
  '? (192.168.0.232) at 00:12:34:56:78:93 [ether] on eth0',
  // "special" cases (eg. unresolved hosts)
  '? (192.168.0.242) at <incomplete> on eth0',
  '192.168.0.243 (192.168.0.243) -- no entry' // host has no entry in the arp table
]

jest.mock('mz/child_process', () => ({
  exec: jest.fn(command => {
    // first filter all special case examples from the mockHost list (eg. no entry)
    const workingHosts = mockHosts.filter(i => i.indexOf('no entry') < 0)
    let r = workingHosts.join('\n')

    // then define the current use-case (arp all or arp one)
    if (command.includes('-n')) {
      // receive the ip address of the request and the mac address from the mocked hosts
      const ip = command.match(/arp -(.*){1} (.*)/)[2]
      const host = mockHosts.find(i => i.indexOf(ip) >= 0)

      if (host.indexOf('no entry') >= 0) {
        r = host
      } else {
        const macAddress = host.split(' ')[3]
        // and finally prepare the arp output for the tests
        r = `Address                  HWtype  HWaddress           Flags Mask            Iface
${ip}             ether   ${macAddress}   C                     eth0`
      }
    }

    // before resolving the promise
    return new Promise(resolve => resolve(r))
  })
}))

describe('local-devices (linux)', () => {
  beforeAll(() => {
    this.originalPlatform = process.platform
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    })
  })

  it('returns the result of all IPs', async () => {
    const result = await find()
    expect(result).toEqual([
      { name: '?', ip: '192.168.0.202', mac: '00:12:34:56:78:90' },
      { name: '?', ip: '192.168.0.212', mac: '00:12:34:56:78:91' },
      { name: '?', ip: '192.168.0.222', mac: '00:12:34:56:78:92' },
      { name: '?', ip: '192.168.0.232', mac: '00:12:34:56:78:93' }
    ])
  })

  it('returns the result of a single IP', async () => {
    const result = await find('192.168.0.222')
    expect(result).toEqual([
      { name: '?', ip: '192.168.0.222', mac: '00:12:34:56:78:92' }
    ])
  })

  it('returns undefined, when the host is not resolved', async () => {
    const result = await find('192.168.0.242')
    expect(result).toBeUndefined()
  })

  it('returns undefined, when the host does not exist in arp table', async () => {
    const result = await find('192.168.0.243')
    expect(result).toBeUndefined()
  })
})
