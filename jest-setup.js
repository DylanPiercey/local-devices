// mocks net.Socket module
// Alternative (not tested yet): https://www.npmjs.com/package/mitm
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
