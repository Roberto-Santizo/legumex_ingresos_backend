/**
 * Concurrency tests for the visit handler.
 *
 * Fires many requests simultaneously using Promise.all to simulate
 * multiple users hitting the API at the same time. Verifies that:
 *   - All requests complete successfully (no crashes, no dropped responses)
 *   - The total wall-clock time stays reasonable
 *   - No request takes longer than SINGLE_THRESHOLD_MS on its own
 */

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockTransaction = { commit: jest.fn().mockResolvedValue(undefined), rollback: jest.fn().mockResolvedValue(undefined) }
jest.mock('../config/db', () => ({ __esModule: true, default: { transaction: jest.fn() } }))
jest.mock('../models/Visit.model',         () => ({ __esModule: true, default: { findAll: jest.fn(), findAndCountAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() } }))
jest.mock('../models/Visit_status.model',  () => ({ __esModule: true, default: { findOne: jest.fn() } }))
jest.mock('../models/VisitCompanion.model', () => ({ __esModule: true, default: { findOne: jest.fn(), bulkCreate: jest.fn() } }))
jest.mock('../models/VisitorPerson.model', () => ({ __esModule: true, default: { findByPk: jest.fn() } }))
jest.mock('../models/Visitor.model',       () => ({ __esModule: true, default: {} }))
jest.mock('../models/Department.model',    () => ({ __esModule: true, default: {} }))
jest.mock('../models/Agent.model',         () => ({ __esModule: true, default: {} }))

// ── Imports ────────────────────────────────────────────────────────────────────

import type { Request, Response } from 'express'
import { getVisits, createVisit, getVisitById } from '../handlers/visit'
import Visit       from '../models/Visit.model'
import VisitStatus from '../models/Visit_status.model'
import db          from '../config/db'

// ── Configuration ──────────────────────────────────────────────────────────────

/** Max time allowed for a single request under concurrent load (ms) */
const SINGLE_THRESHOLD_MS = 500

/** Max total wall-clock time to complete all concurrent requests (ms) */
const TOTAL_THRESHOLD_MS = 2000

function makeVisit(i: number) {
    return {
        id: i,
        visitor_id: (i % 50) + 1,
        date: new Date().toISOString(),
        visit_status_id: 1,
        department_id: 1,
        responsible_person: `Person ${i}`,
        destination: `Location ${i}`,
        visitor:          { id: i, name: `Company ${i}` },
        visitor_person:   { id: i, name: `Visitor ${i}`, document_number: `${1_000_000 + i}`, document_photo: null, license_number: null, license_photo: null },
        visit_status:     { id: 1, name: 'PROGRAMADA' },
        department:       { id: 1, name: 'Dept 1' },
        agent:            null,
        visit_companions: [],
    }
}

/** Creates a fresh mock req/res pair for each simulated request */
function makeCall() {
    const r: Record<string, jest.Mock> = {}
    r.status = jest.fn().mockReturnValue(r)
    r.json   = jest.fn().mockReturnValue(r)

    const request: Partial<Request> = {
        body: {}, params: {}, query: {},
        user: {
            id: 1, name: 'Admin', username: 'admin', role: 'Administrator',
            permissions: ['visits:view:all', 'visits:create'],
        },
    }

    return { request, response: r }
}

// ── Concurrent reads ───────────────────────────────────────────────────────────

describe('Concurrency – simultaneous GET /visit', () => {
    beforeEach(() => jest.clearAllMocks())

    test.each([
        [100,  'moderate concurrency'],
        [500,  'high concurrency'],
        [1000, 'extreme concurrency'],
    ])('%d simultaneous requests (%s) – all succeed, total < ' + TOTAL_THRESHOLD_MS + 'ms', async (concurrent) => {
        // Each simulated DB call returns 50 visits
        const dataset = Array.from({ length: 50 }, (_, i) => makeVisit(i + 1))
        ;(Visit.findAndCountAll as jest.Mock).mockResolvedValue({ count: 50, rows: dataset })

        // Fire all requests at the exact same moment
        const calls = Array.from({ length: concurrent }, () => {
            const { request, response } = makeCall()
            const start = performance.now()
            return getVisits(request as Request, response as unknown as Response)
                .then(() => ({ response, elapsed: performance.now() - start }))
        })

        const wallStart = performance.now()
        const results   = await Promise.all(calls)
        const wallTime  = performance.now() - wallStart

        // Every single request must have returned 200
        const failures = results.filter(({ response }) =>
            (response.status as jest.Mock).mock.calls[0]?.[0] !== 200
        )

        console.log(`  ${concurrent} concurrent | wall: ${wallTime.toFixed(2)} ms | slowest: ${Math.max(...results.map(r => r.elapsed)).toFixed(2)} ms | failures: ${failures.length}`)

        expect(failures.length).toBe(0)                         // no crashes
        expect(wallTime).toBeLessThan(TOTAL_THRESHOLD_MS)       // total time acceptable
        results.forEach(({ elapsed }) => {
            expect(elapsed).toBeLessThan(SINGLE_THRESHOLD_MS)   // no single request hanged
        })
    })
})

// ── Concurrent writes ──────────────────────────────────────────────────────────

describe('Concurrency – simultaneous POST /visit', () => {
    beforeEach(() => jest.clearAllMocks())

    const validBody = {
        visitor_id: 1,
        date: '2024-06-01',
        department_id: 1,
        responsible_person: 'John Smith',
        destination: 'Room A',
    }

    test.each([
        [50,  'moderate writes'],
        [200, 'high writes'],
    ])('%d simultaneous create requests (%s) – all succeed', async (concurrent) => {
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })
        ;(Visit.create as jest.Mock).mockImplementation((data: unknown) =>
            Promise.resolve({ id: Math.random(), ...data as object })
        )

        const calls = Array.from({ length: concurrent }, () => {
            const { request, response } = makeCall()
            request.body = validBody
            return getVisits    // we call createVisit below, just building the array
                ? createVisit(request as Request, response as unknown as Response)
                    .then(() => response)
                : Promise.resolve(response)
        })

        const results = await Promise.all(calls)

        const failures = results.filter(r =>
            (r.status as jest.Mock).mock.calls[0]?.[0] !== 201
        )

        console.log(`  ${concurrent} concurrent writes | failures: ${failures.length}`)
        expect(failures.length).toBe(0)
    })
})

// ── Mixed concurrent reads + writes ───────────────────────────────────────────

describe('Concurrency – mixed reads and writes', () => {
    beforeEach(() => jest.clearAllMocks())

    it('200 simultaneous reads + 50 writes at the same time – none fail', async () => {
        const dataset = Array.from({ length: 100 }, (_, i) => makeVisit(i + 1))
        ;(Visit.findAll as jest.Mock).mockResolvedValue(dataset)
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })
        ;(Visit.create as jest.Mock).mockImplementation((data: unknown) =>
            Promise.resolve({ id: Math.random(), ...data as object })
        )

        const reads = Array.from({ length: 200 }, () => {
            const { request, response } = makeCall()
            return getVisits(request as Request, response as unknown as Response)
                .then(() => ({ type: 'read' as const, response, ok: (response.status as jest.Mock).mock.calls[0]?.[0] === 200 }))
        })

        const writes = Array.from({ length: 50 }, () => {
            const { request, response } = makeCall()
            request.body = { visitor_id: 1, date: '2024-06-01', department_id: 1, responsible_person: 'John', destination: 'Room A' }
            return createVisit(request as Request, response as unknown as Response)
                .then(() => ({ type: 'write' as const, response, ok: (response.status as jest.Mock).mock.calls[0]?.[0] === 201 }))
        })

        const wallStart = performance.now()
        const results   = await Promise.all([...reads, ...writes])
        const wallTime  = performance.now() - wallStart

        const failedReads  = results.filter(r => r.type === 'read'  && !r.ok).length
        const failedWrites = results.filter(r => r.type === 'write' && !r.ok).length

        console.log(`  200 reads + 50 writes | wall: ${wallTime.toFixed(2)} ms | failed reads: ${failedReads} | failed writes: ${failedWrites}`)

        expect(failedReads).toBe(0)
        expect(failedWrites).toBe(0)
        expect(wallTime).toBeLessThan(TOTAL_THRESHOLD_MS)
    })
})

// ── Concurrent reads by ID ─────────────────────────────────────────────────────

describe('Concurrency – simultaneous GET /visit/:id', () => {
    beforeEach(() => jest.clearAllMocks())

    it('500 simultaneous getVisitById requests – none return 500', async () => {
        ;(Visit.findByPk as jest.Mock).mockImplementation((id: number) =>
            Promise.resolve(makeVisit(id))
        )

        const calls = Array.from({ length: 500 }, (_, i) => {
            const { request, response } = makeCall()
            request.params = { id: String((i % 100) + 1) }
            return getVisitById(request as Request, response as unknown as Response)
                .then(() => (response.status as jest.Mock).mock.calls[0]?.[0] as number)
        })

        const statuses = await Promise.all(calls)

        const errors = statuses.filter(s => s === 500)
        console.log(`  500 concurrent getById | 500-errors: ${errors.length}`)

        expect(errors.length).toBe(0)
    })
})
