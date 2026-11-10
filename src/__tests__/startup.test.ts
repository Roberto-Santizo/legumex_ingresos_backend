jest.mock('../server', () => ({ __esModule: true, default: { listen: jest.fn() } }))
jest.mock('../config/db', () => ({ __esModule: true, default: { close: jest.fn() } }))
jest.mock('../database/dbConnection', () => ({ connectDB: jest.fn() }))
jest.mock('../handlers/VisitsModule/visit', () => ({ closeExpiredTempExits: jest.fn() }))

import server from '../server'
import db from '../config/db'
import { connectDB } from '../database/dbConnection'

const originalExitCode = process.exitCode

beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(global, 'setInterval').mockImplementation(() => undefined as any)
    ;(db.close as jest.Mock).mockResolvedValue(undefined)
    process.exitCode = undefined
})

afterEach(() => {
    process.exitCode = originalExitCode
    jest.restoreAllMocks()
})

async function loadEntrypoint() {
    // El punto de entrada inicia main() sin bloquear el import.
    jest.isolateModules(() => {
        // Usar los mismos mocks dentro del registro aislado de módulos.
        jest.doMock('../server', () => ({ __esModule: true, default: server }))
        jest.doMock('../config/db', () => ({ __esModule: true, default: db }))
        jest.doMock('../database/dbConnection', () => ({ connectDB }))
        require('../index')
    })
    await new Promise<void>(resolve => setImmediate(resolve))
}

it('does not listen or schedule background work when the database fails', async () => {
    const error = new Error('Database unavailable')
    ;(connectDB as jest.Mock).mockRejectedValue(error)

    await loadEntrypoint()

    expect(server.listen).not.toHaveBeenCalled()
    expect(setInterval).not.toHaveBeenCalled()
    expect(db.close).toHaveBeenCalledTimes(1)
    expect(process.exitCode).toBe(1)
    expect(console.error).toHaveBeenCalledWith('No se pudo iniciar el servidor:', error)
})

it('starts listening and scheduling only after database initialization succeeds', async () => {
    let ready!: () => void
    ;(connectDB as jest.Mock).mockReturnValue(new Promise<void>(resolve => { ready = resolve }))
    const loading = loadEntrypoint()
    expect(server.listen).not.toHaveBeenCalled()
    expect(setInterval).not.toHaveBeenCalled()

    ready()
    await loading

    expect(server.listen).toHaveBeenCalledTimes(1)
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60_000)
    expect(db.close).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
})
