jest.mock('../config/db', () => ({
    __esModule: true,
    default: { authenticate: jest.fn(), sync: jest.fn(), query: jest.fn() },
}))
jest.mock('../database/seeder', () => ({ runSeeders: jest.fn() }))

import db from '../config/db'
import { runSeeders } from '../database/seeder'
import { connectDB } from '../database/dbConnection'

beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    ;(db.authenticate as jest.Mock).mockResolvedValue(undefined)
    ;(db.sync as jest.Mock).mockResolvedValue(undefined)
    ;(db.query as jest.Mock).mockResolvedValue(undefined)
    ;(runSeeders as jest.Mock).mockResolvedValue(undefined)
})

afterEach(() => jest.restoreAllMocks())

it('completes database initialization before resolving', async () => {
    await expect(connectDB()).resolves.toBeUndefined()
    expect(db.authenticate).toHaveBeenCalledTimes(1)
    expect(db.sync).toHaveBeenCalledTimes(1)
    expect(runSeeders).toHaveBeenCalledTimes(1)
})

it('propagates authentication failures without syncing or seeding', async () => {
    const error = new Error('Database unavailable')
    ;(db.authenticate as jest.Mock).mockRejectedValue(error)

    await expect(connectDB()).rejects.toBe(error)
    expect(db.sync).not.toHaveBeenCalled()
    expect(runSeeders).not.toHaveBeenCalled()
})

it('propagates synchronization failures without seeding', async () => {
    const error = new Error('Schema synchronization failed')
    ;(db.sync as jest.Mock).mockRejectedValue(error)

    await expect(connectDB()).rejects.toBe(error)
    expect(runSeeders).not.toHaveBeenCalled()
})

it('propagates seeder failures', async () => {
    const error = new Error('Seeding failed')
    ;(runSeeders as jest.Mock).mockRejectedValue(error)

    await expect(connectDB()).rejects.toBe(error)
})
