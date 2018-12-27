const find = require('../src/index')

describe('local-devices', () => {
  const platforms = [
    'linux',
    'darwin'
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
    })
  })
})
