const find = require('../src/index')
var cp = require('mz/child_process')

const TEN_MEGA_BYTE = 1024 * 1024 * 10
const ONE_MINUTE = 60 * 1000

describe('local-devices', () => {
  const platforms = [
    'linux',
    'darwin',
    'win32'
  ]

  beforeAll(() => {
    this.originalPlatform = process.platform
  })

  afterAll(() => {
    Object.defineProperty(process, 'platform', {
      value: this.originalPlatform
    })
  })

  platforms.forEach(platform => {
    describe(`on ${platform}`, () => {
      beforeAll(() => {
        Object.defineProperty(process, 'platform', {
          value: platform
        })
      })

      afterEach(() => cp.exec.mockClear())

      it('returns the result of all IPs', async () => {
        const result = await find()
        expect(result).toEqual([
          { name: '?', ip: '192.168.0.202', mac: '00:12:34:56:78:90' },
          { name: '?', ip: '192.168.0.212', mac: '00:12:34:56:78:91' },
          { name: '?', ip: '192.168.0.222', mac: '00:12:34:56:78:92' },
          { name: '?', ip: '192.168.0.232', mac: '00:12:34:56:78:93' },
          { name: '?', ip: '192.168.1.234', mac: '00:12:34:56:78:94' }
        ])
      })

      it('returns empty list if empty response returned', async () => {
        cp.exec.mockImplementationOnce(_ => Promise.resolve())
        const result = await find()
        expect(result).toEqual([])
      })

      it('returns all IPs within /24 range', async () => {
        const result = await find('192.168.1.0/24')
        expect(result).toEqual([
          { name: '?', ip: '192.168.1.234', mac: '00:12:34:56:78:94' }
        ])
      })

      it('returns all IPs within 1-254 range', async () => {
        const result = await find('192.168.1.1-192.168.1.254')
        expect(result).toEqual([
          { name: '?', ip: '192.168.1.234', mac: '00:12:34:56:78:94' }
        ])
      })

      it('returns the result of a single IP (Note: undefined on win32)', async () => {
        const result = await find('192.168.0.222')

        if (process.platform.includes('win32')) {
          // not supported yet
          expect(result).toBeUndefined()
          return
        }

        expect(result).toEqual(
          { name: '?', ip: '192.168.0.222', mac: '00:12:34:56:78:92' }
        )
      })

      it('returns undefined, when the host is not resolved', async () => {
        const result = await find('192.168.0.242')
        expect(result).toBeUndefined()
      })

      it('returns undefined, when the host does not exist in arp table', async () => {
        const result = await find('192.168.0.243')
        expect(result).toBeUndefined()
      })

      it('rejects when the host is not a valid ip address', async () => {
        await expect(find('127.0.0.1 | mkdir attacker')).rejects.toThrow('Invalid IP')
      })

      it('invokes cp.exec with maxBuffer of 10 MB and a timeout of 1 minute, when invoking find without an ip', async () => {
        await find()
        expect(cp.exec).toHaveBeenCalledWith('arp -a', { maxBuffer: TEN_MEGA_BYTE, timeout: ONE_MINUTE })
      })

      it('invokes cp.exec with maxBuffer of 10 MB and a timeout of 1 minute, when invoking find without an ip and skip name resolution', async () => {
        await find(null, true)
        if (process.platform.includes('win32')) {
          expect(cp.exec).toHaveBeenCalledWith('arp -a', { maxBuffer: TEN_MEGA_BYTE, timeout: ONE_MINUTE })
        } else {
          expect(cp.exec).toHaveBeenCalledWith('arp -an', { maxBuffer: TEN_MEGA_BYTE, timeout: ONE_MINUTE })
        }
      })

      it('invokes cp.exec with maxBuffer of 10 MB and a timeout of 1 minute, when invoking find with a single ip', async () => {
        await find('192.168.0.242')
        expect(cp.exec).toHaveBeenCalledWith('arp -n 192.168.0.242', { maxBuffer: TEN_MEGA_BYTE, timeout: ONE_MINUTE })
      })
    })
  })
})
