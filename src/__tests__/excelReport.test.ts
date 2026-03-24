/**
 * Diagnostic test for GET /api/reports/excel
 *
 * Uses supertest to hit the real Express app (same as Postman would).
 * Auth middleware is bypassed so we can isolate routing from permissions.
 * All Sequelize models are mocked so no real DB is needed.
 */

// ── Mock DB & models ────────────────────────────────────────────────────────

jest.mock('../config/db', () => ({
    __esModule: true,
    default: {
        authenticate: jest.fn().mockResolvedValue(undefined),
        sync:         jest.fn().mockResolvedValue(undefined),
        query:        jest.fn().mockResolvedValue(undefined),
    },
}))

jest.mock('../models/Visit.model', () => ({
    __esModule: true,
    default: { findAll: jest.fn() },
}))

jest.mock('../models/Visitor.model',       () => ({ __esModule: true, default: {} }))
jest.mock('../models/VisitorPerson.model', () => ({ __esModule: true, default: {} }))
jest.mock('../models/VisitCompanion.model',() => ({ __esModule: true, default: {} }))
jest.mock('../models/Department.model',    () => ({ __esModule: true, default: {} }))
jest.mock('../models/Agent.model',         () => ({ __esModule: true, default: {} }))
jest.mock('../models/Visit_status.model',  () => ({ __esModule: true, default: { bulkCreate: jest.fn().mockResolvedValue(undefined), findOne: jest.fn() } }))
jest.mock('../models/Permission.model',    () => ({ __esModule: true, default: { bulkCreate: jest.fn().mockResolvedValue(undefined), findAll: jest.fn().mockResolvedValue([]) } }))
jest.mock('../models/Role.model',          () => ({ __esModule: true, default: { findOrCreate: jest.fn().mockResolvedValue([{ id: 1 }, true]) } }))
jest.mock('../models/RolePermission.model',() => ({ __esModule: true, default: { findAll: jest.fn().mockResolvedValue([]), bulkCreate: jest.fn().mockResolvedValue(undefined) } }))
jest.mock('../models/User.model',          () => ({ __esModule: true, default: { findOne: jest.fn().mockResolvedValue({ id: 1 }), create: jest.fn() } }))
jest.mock('../models/Department.model',    () => ({ __esModule: true, default: { findOrCreate: jest.fn().mockResolvedValue([{ id: 1 }, true]) } }))

// ── Mock JWT middleware — let every request through ─────────────────────────

jest.mock('../middleware/jwt', () => ({
    validateJWT:     (_req: any, _res: any, next: any) => next(),
    checkPermission: ()  => (_req: any, _res: any, next: any) => next(),
}))

// ── Imports (after mocks) ────────────────────────────────────────────────────

import request from 'supertest'
import server  from '../server'
import Visit   from '../models/Visit.model'

// ── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/reports/excel', () => {

    beforeEach(() => jest.clearAllMocks())

    it('route exists — should NOT return 404', async () => {
        // Arrange: return an empty visit list so the handler can build an empty Excel file
        ;(Visit.findAll as jest.Mock).mockResolvedValue([])

        // Act
        const res = await request(server)
            .get('/api/reports/excel')
            .query({ from: '2026-03-01', to: '2026-03-23' })

        // Assert: if this fails with 404 the route is not registered
        console.log('Response status:', res.status)
        console.log('Content-Type:',    res.headers['content-type'])
        expect(res.status).not.toBe(404)
    })

    it('returns 400 when query params are missing', async () => {
        const res = await request(server)
            .get('/api/reports/excel')

        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/from/)
    })

    it('returns an xlsx file when visits exist', async () => {
        // Arrange: one visit with all associations
        ;(Visit.findAll as jest.Mock).mockResolvedValue([
            {
                date:               new Date('2026-03-15'),
                destination:        'Sala de Reuniones',
                responsible_person: 'Carlos López',
                entry_time:         '08:30',
                exit_time:          '10:00',
                get: (key: string) => {
                    const data: Record<string, any> = {
                        visitor:          { name: 'Empresa ABC' },
                        visitor_person:   { name: 'Juan Pérez', document_number: '1234567890101' },
                        department:       { name: 'Operaciones' },
                        visit_companions: [],
                    }
                    return data[key] ?? null
                },
            },
        ])

        // Act
        const res = await request(server)
            .get('/api/reports/excel')
            .query({ from: '2026-03-01', to: '2026-03-23' })

        // Assert
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toContain(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        expect(res.headers['content-disposition']).toContain('.xlsx')
    })
})
