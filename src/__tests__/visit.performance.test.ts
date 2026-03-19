/**
 * Performance tests for the visit handler.
 *
 * Verify that endpoints do not slow down when the database holds
 * many records. findAll is mocked to return N simulated records
 * and the handler response time is measured.
 *
 * Threshold: every response must complete in less than THRESHOLD_MS
 * regardless of how many records the DB returns.
 */

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('../config/db', () => ({ __esModule: true, default: { transaction: jest.fn() } }))
jest.mock('../models/Visit.model',         () => ({ __esModule: true, default: { findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn() } }))
jest.mock('../models/Visit_status.model',  () => ({ __esModule: true, default: { findOne: jest.fn() } }))
jest.mock('../models/VisitCompanion.model', () => ({ __esModule: true, default: {} }))
jest.mock('../models/VisitorPerson.model', () => ({ __esModule: true, default: {} }))
jest.mock('../models/Visitor.model',       () => ({ __esModule: true, default: {} }))
jest.mock('../models/Department.model',    () => ({ __esModule: true, default: {} }))
jest.mock('../models/Agent.model',         () => ({ __esModule: true, default: {} }))

// ── Imports ────────────────────────────────────────────────────────────────────

import type { Request, Response } from 'express'
import { getVisits, getVisitsToday, getVisitsActive } from '../handlers/visit'
import Visit       from '../models/Visit.model'
import VisitStatus from '../models/Visit_status.model'

// ── Configuration ──────────────────────────────────────────────────────────────

/** Maximum acceptable response time per call (ms) */
const THRESHOLD_MS = 500

/** Builds a simulated visit object */
function makeVisit(i: number) {
    return {
        id: i,
        visitor_id:         (i % 50) + 1,
        date:               new Date().toISOString(),
        visit_status_id:    (i % 4) + 1,
        department_id:      (i % 5) + 1,
        responsible_person: `Person ${i}`,
        destination:        `Location ${i}`,
        visitor:            { id: i, name: `Company ${i}` },
        visitor_person:     {
            id: i, name: `Visitor ${i}`,
            document_number: `${1_000_000 + i}`,
            document_photo: null, license_number: null, license_photo: null,
        },
        visit_status:     { id: (i % 4) + 1, name: 'PROGRAMADA' },
        department:       { id: (i % 5) + 1, name: `Dept ${i % 5}` },
        agent:            null,
        visit_companions: [],
    }
}

function req(overrides: Record<string, unknown> = {}): Partial<Request> {
    return {
        body: {}, params: {}, query: {},
        user: {
            id: 1, name: 'Admin', username: 'admin', role: 'Administrator',
            permissions: ['visits:view:all'],
        },
        ...overrides,
    }
}

function res() {
    const r: Record<string, jest.Mock> = {}
    r.status = jest.fn().mockReturnValue(r)
    r.json   = jest.fn().mockReturnValue(r)
    return r
}

// ── Performance: getVisits ─────────────────────────────────────────────────────

describe('Performance – getVisits', () => {
    beforeEach(() => jest.clearAllMocks())

    /**
     * With 100, 500 and 1000 records the handler must always respond
     * in less than THRESHOLD_MS.
     */
    test.each([
        [100,  'low load'],
        [500,  'medium load'],
        [1000, 'high load'],
    ])('with %d records (%s) responds in < ' + THRESHOLD_MS + 'ms', async (count) => {
        const dataset = Array.from({ length: count }, (_, i) => makeVisit(i + 1))
        ;(Visit.findAll as jest.Mock).mockResolvedValue(dataset)

        const r = res()
        const start = performance.now()
        await getVisits(req() as Request, r as unknown as Response)
        const elapsed = performance.now() - start

        expect(r.status).toHaveBeenCalledWith(200)
        expect(elapsed).toBeLessThan(THRESHOLD_MS)

        console.log(`  getVisits(${count} records): ${elapsed.toFixed(2)} ms`)
    })

    /**
     * 50 consecutive calls with 200 records each.
     * Average must be < 50 ms and no single call must exceed THRESHOLD_MS.
     */
    it('50 consecutive calls maintain stable performance', async () => {
        const dataset = Array.from({ length: 200 }, (_, i) => makeVisit(i + 1))
        ;(Visit.findAll as jest.Mock).mockResolvedValue(dataset)

        const times: number[] = []
        for (let i = 0; i < 50; i++) {
            const r = res()
            const start = performance.now()
            await getVisits(req() as Request, r as unknown as Response)
            times.push(performance.now() - start)
        }

        const avg = times.reduce((a, b) => a + b, 0) / times.length
        const max = Math.max(...times)

        console.log(`  50 calls | avg: ${avg.toFixed(2)} ms | max: ${max.toFixed(2)} ms`)

        expect(avg).toBeLessThan(50)
        expect(max).toBeLessThan(THRESHOLD_MS)
    })
})

// ── Performance: getVisitsToday ────────────────────────────────────────────────

describe('Performance – getVisitsToday', () => {
    beforeEach(() => jest.clearAllMocks())

    test.each([
        [100, 'normal day'],
        [500, 'busy day'],
    ])("with %d today's visits (%s) responds in < " + THRESHOLD_MS + 'ms', async (count) => {
        const dataset = Array.from({ length: count }, (_, i) => makeVisit(i + 1))
        ;(Visit.findAll as jest.Mock).mockResolvedValue(dataset)

        const r = res()
        const start = performance.now()
        await getVisitsToday(req() as Request, r as unknown as Response)
        const elapsed = performance.now() - start

        expect(r.status).toHaveBeenCalledWith(200)
        expect(elapsed).toBeLessThan(THRESHOLD_MS)

        console.log(`  getVisitsToday(${count} records): ${elapsed.toFixed(2)} ms`)
    })
})

// ── Performance: getVisitsActive ───────────────────────────────────────────────

describe('Performance – getVisitsActive', () => {
    beforeEach(() => jest.clearAllMocks())

    test.each([
        [50,  'few active'],
        [200, 'many simultaneous active'],
    ])('with %d active visits (%s) responds in < ' + THRESHOLD_MS + 'ms', async (count) => {
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 2, name: 'EN PLANTA' })
        const dataset = Array.from({ length: count }, (_, i) => makeVisit(i + 1))
        ;(Visit.findAll as jest.Mock).mockResolvedValue(dataset)

        const r = res()
        const start = performance.now()
        await getVisitsActive(req() as Request, r as unknown as Response)
        const elapsed = performance.now() - start

        expect(r.status).toHaveBeenCalledWith(200)
        expect(elapsed).toBeLessThan(THRESHOLD_MS)

        console.log(`  getVisitsActive(${count} records): ${elapsed.toFixed(2)} ms`)
    })
})
