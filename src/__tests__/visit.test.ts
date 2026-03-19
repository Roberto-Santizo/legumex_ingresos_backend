/**
 * Functional tests for the visit handler.
 *
 * Models and database are mocked so no real PostgreSQL connection
 * is required. Each test verifies that the handler responds with
 * the correct HTTP status code and expected response body.
 */

// ── Mocks (jest.mock is hoisted automatically before imports) ──────────────────
//
// We mock every Sequelize model and the DB instance so that when
// the handler calls Visit.findAll(), VisitStatus.findOne(), etc.,
// it hits our fake functions instead of a real database.
// Each mock replaces the module's default export with a plain object
// whose methods are jest.fn() — meaning we can control what they
// return on a per-test basis with .mockResolvedValue().

jest.mock('../config/db', () => ({
    __esModule: true,
    default: { transaction: jest.fn() },
}))

jest.mock('../models/Visit.model', () => ({
    __esModule: true,
    default: { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn() },
}))

jest.mock('../models/Visit_status.model', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), bulkCreate: jest.fn() },
}))

jest.mock('../models/VisitCompanion.model', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), bulkCreate: jest.fn() },
}))

jest.mock('../models/VisitorPerson.model', () => ({
    __esModule: true,
    default: { findByPk: jest.fn() },
}))

// These models are imported by the handler file but not used in the
// tested functions, so we replace them with empty objects to satisfy
// the import without any behavior.
jest.mock('../models/Visitor.model',    () => ({ __esModule: true, default: {} }))
jest.mock('../models/Department.model', () => ({ __esModule: true, default: {} }))
jest.mock('../models/Agent.model',      () => ({ __esModule: true, default: {} }))

// ── Imports ────────────────────────────────────────────────────────────────────

import type { Request, Response } from 'express'
import {createVisit,getVisits,getVisitById,checkIn,checkOut,cancelVisit} from '../handlers/visit'
import Visit         from '../models/Visit.model'
import VisitStatus   from '../models/Visit_status.model'
import db            from '../config/db'

// ── Helpers ────────────────────────────────────────────────────────────────────

// A fake authenticated user attached to every request.
// permissions lists every action so no test fails due to missing permissions.
const adminUser = {
    id: 1,
    name: 'TestUser',
    username: 'test',
    role: 'Administrator',
    permissions: [
        'visits:view', 'visits:view:all', 'visits:create',
        'visits:checkin', 'visits:checkout', 'visits:cancel',
    ],
}

// req() builds a minimal Express Request object.
// Pass overrides to set body, params, query, or a different user.
function req(overrides: Record<string, unknown> = {}): Partial<Request> {
    return { body: {}, params: {}, query: {}, user: adminUser, ...overrides }
}

// res() builds a minimal Express Response object.
// status() and json() are jest mocks that return `this` so the handler
// can chain them: res.status(200).json({...})
function res() {
    const r: Record<string, jest.Mock> = {}
    r.status = jest.fn().mockReturnValue(r)
    r.json   = jest.fn().mockReturnValue(r)
    return r
}

// ── createVisit ────────────────────────────────────────────────────────────────

describe('createVisit', () => {
    // A complete valid body that satisfies all required fields.
    const validBody = {
        visitor_id: 1,
        date: '2024-06-01',
        department_id: 1,
        responsible_person: 'John Smith',
        destination: 'Room A',
    }

    // Reset all mock call history before each test so one test
    // cannot accidentally influence the next one.
    beforeEach(() => jest.clearAllMocks())

    it('creates a visit with valid data → 201', async () => {
        // Arrange: tell the mocks what to return.
        // The handler first looks up the 'PROGRAMADA' status row,
        // then calls Visit.create() with the new visit data.
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })
        ;(Visit.create as jest.Mock).mockResolvedValue({ id: 10, ...validBody, visit_status_id: 1 })

        // Act: call the handler with a valid request.
        const r = res()
        await createVisit(req({ body: validBody }) as Request, r as unknown as Response)

        // Assert: the handler must reply 201 and include a success message.
        expect(r.status).toHaveBeenCalledWith(201)
        expect(r.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Cita programada correctamente' })
        )
    })

    it('fails when required fields are missing → 400', async () => {
        // Arrange: send a body that only has visitor_id, missing
        // date, department_id, responsible_person, and destination.

        // Act
        const r = res()
        await createVisit(req({ body: { visitor_id: 1 } }) as Request, r as unknown as Response)

        // Assert: the handler catches the missing fields before touching
        // the DB and returns 400 Bad Request.
        expect(r.status).toHaveBeenCalledWith(400)
    })

    it('fails when PROGRAMADA status does not exist in the DB → 500', async () => {
        // Arrange: simulate a DB state where the seed data is missing —
        // VisitStatus.findOne returns null instead of a status row.
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue(null)

        // Act
        const r = res()
        await createVisit(req({ body: validBody }) as Request, r as unknown as Response)

        // Assert: without a valid status the handler cannot create
        // the visit and must return 500 Internal Server Error.
        expect(r.status).toHaveBeenCalledWith(500)
    })
})

// ── getVisits ──────────────────────────────────────────────────────────────────

describe('getVisits', () => {
    beforeEach(() => jest.clearAllMocks())

    it('returns the list of visits → 200', async () => {
        // Arrange: the DB returns three visits.
        const mockVisits = [{ id: 1 }, { id: 2 }, { id: 3 }]
        ;(Visit.findAll as jest.Mock).mockResolvedValue(mockVisits)

        // Act: admin user has visits:view:all so no extra filtering is applied.
        const r = res()
        await getVisits(req() as Request, r as unknown as Response)

        // Assert: 200 and the exact array the DB returned.
        expect(r.status).toHaveBeenCalledWith(200)
        expect(r.json).toHaveBeenCalledWith({ data: mockVisits })
    })

    it('without visits:view:all permission only returns own visits', async () => {
        // Arrange: create a user that only has the basic visits:view permission
        // (not the 'all' variant), so the handler must add a created_by filter.
        const limitedUser = { ...adminUser, permissions: ['visits:view'] }
        ;(Visit.findAll as jest.Mock).mockResolvedValue([])

        // Act
        const r = res()
        await getVisits(req({ user: limitedUser }) as Request, r as unknown as Response)

        // Assert: inspect the actual arguments passed to Visit.findAll
        // and confirm the where clause includes created_by: 1 (the user's id).
        const callArgs = (Visit.findAll as jest.Mock).mock.calls[0][0]
        expect(callArgs.where).toHaveProperty('created_by', 1)
    })

    it('filters by status when ?status query param is provided', async () => {
        // Arrange: the client sends ?status=PROGRAMADA.
        // The handler first resolves the name to a DB row, then uses
        // its id to filter.
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })
        ;(Visit.findAll as jest.Mock).mockResolvedValue([])

        // Act
        const r = res()
        await getVisits(req({ query: { status: 'PROGRAMADA' } }) as Request, r as unknown as Response)

        // Assert: Visit.findAll must have been called with visit_status_id: 1
        // in the where clause — not with the raw string 'PROGRAMADA'.
        const callArgs = (Visit.findAll as jest.Mock).mock.calls[0][0]
        expect(callArgs.where).toHaveProperty('visit_status_id', 1)
    })
})

// ── getVisitById ───────────────────────────────────────────────────────────────

describe('getVisitById', () => {
    beforeEach(() => jest.clearAllMocks())

    it('returns the visit when it exists → 200', async () => {
        // Arrange: the DB finds a visit with id 5.
        const mockVisit = { id: 5, visitor_id: 1 }
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(mockVisit)

        // Act: request visit with id '5' (string, as Express provides it).
        const r = res()
        await getVisitById(req({ params: { id: '5' } }) as Request, r as unknown as Response)

        // Assert: the handler wraps the result inside { data: ... }.
        expect(r.status).toHaveBeenCalledWith(200)
        expect(r.json).toHaveBeenCalledWith({ data: mockVisit })
    })

    it('returns 404 when the visit does not exist', async () => {
        // Arrange: findByPk returns null — the record is not in the DB.
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(null)

        // Act: request a visit id that does not exist.
        const r = res()
        await getVisitById(req({ params: { id: '999' } }) as Request, r as unknown as Response)

        // Assert: the handler must return 404 Not Found.
        expect(r.status).toHaveBeenCalledWith(404)
    })
})

// ── checkIn ────────────────────────────────────────────────────────────────────

describe('checkIn', () => {
    // Minimum valid body for a check-in request.
    const validCheckIn = {
        visitor_person_id: 10,
        entry_time: '2024-06-01T08:00:00Z',
        badge_number: 'B001',
        agent_id: 2,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // checkIn wraps its DB writes in a transaction.
        // We return a fake transaction object so the handler can call
        // commit() and rollback() without hitting a real database.
        ;(db.transaction as jest.Mock).mockResolvedValue({
            commit:   jest.fn().mockResolvedValue(undefined),
            rollback: jest.fn().mockResolvedValue(undefined),
        })
    })

    it('performs check-in successfully → 200', async () => {
        // Arrange:
        // 1. The visit exists and is in PROGRAMADA status (visit_status_id: 1).
        // 2. The status lookups return PROGRAMADA first, then EN PLANTA.
        // 3. No other active visit exists for this person (findOne returns null).
        // 4. After the transaction commits, findByPk is called again to build
        //    the full response — we return a different object for that call.
        const mockVisit = { id: 1, visit_status_id: 1, update: jest.fn().mockResolvedValue(undefined) }

        ;(Visit.findByPk as jest.Mock)
            .mockResolvedValueOnce(mockVisit)                      // first call: fetch the visit
            .mockResolvedValueOnce({ id: 1, visit_status_id: 2 }) // second call: final response
        ;(VisitStatus.findOne as jest.Mock)
            .mockResolvedValueOnce({ id: 1, name: 'PROGRAMADA' })
            .mockResolvedValueOnce({ id: 2, name: 'EN PLANTA' })
        ;(Visit.findOne as jest.Mock).mockResolvedValue(null) // nobody else currently inside the plant

        // Act
        const r = res()
        await checkIn(
            req({ params: { id: '1' }, body: validCheckIn }) as Request,
            r as unknown as Response
        )

        // Assert: 200 and the check-in confirmation message.
        expect(r.status).toHaveBeenCalledWith(200)
        expect(r.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Check-in realizado correctamente' })
        )
    })

    it('fails when the visit does not exist → 404', async () => {
        // Arrange: findByPk returns null — visit id 999 is not in the DB.
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(null)

        // Act
        const r = res()
        await checkIn(
            req({ params: { id: '999' }, body: validCheckIn }) as Request,
            r as unknown as Response
        )

        // Assert: the handler stops immediately and returns 404.
        expect(r.status).toHaveBeenCalledWith(404)
    })

    it('fails when the visit is not in PROGRAMADA status → 400', async () => {
        // Arrange: the visit has visit_status_id: 2 (EN PLANTA), but
        // VisitStatus.findOne returns an object with id: 1 for PROGRAMADA.
        // Since 2 !== 1, the handler rejects the check-in.
        const visitNotScheduled = { id: 1, visit_status_id: 2, update: jest.fn() }
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(visitNotScheduled)
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })

        // Act
        const r = res()
        await checkIn(
            req({ params: { id: '1' }, body: validCheckIn }) as Request,
            r as unknown as Response
        )

        // Assert: check-in is not allowed when the visit is not scheduled.
        expect(r.status).toHaveBeenCalledWith(400)
    })

    it('fails when required body fields are missing → 400', async () => {
        // Arrange: the visit exists and is PROGRAMADA, but the request
        // body is empty — missing visitor_person_id, entry_time, etc.
        const mockVisit = { id: 1, visit_status_id: 1, update: jest.fn() }
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(mockVisit)
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })

        // Act
        const r = res()
        await checkIn(
            req({ params: { id: '1' }, body: {} }) as Request,
            r as unknown as Response
        )

        // Assert: the handler validates the body before writing to the DB.
        expect(r.status).toHaveBeenCalledWith(400)
    })

    it('fails when the main visitor is already inside the plant → 409', async () => {
        // Arrange: the handler checks if visitor_person_id 10 already has
        // an active visit with status EN PLANTA. We simulate that case by
        // returning an existing visit from Visit.findOne.
        const mockVisit   = { id: 1, visit_status_id: 1, update: jest.fn() }
        const activeVisit = { id: 99, visitor_person: { name: 'John', document_number: '12345' } }

        ;(Visit.findByPk as jest.Mock).mockResolvedValue(mockVisit)
        ;(VisitStatus.findOne as jest.Mock)
            .mockResolvedValueOnce({ id: 1, name: 'PROGRAMADA' })
            .mockResolvedValueOnce({ id: 2, name: 'EN PLANTA' })
        ;(Visit.findOne as jest.Mock).mockResolvedValue(activeVisit) // person found in another active visit

        // Act
        const r = res()
        await checkIn(
            req({ params: { id: '1' }, body: validCheckIn }) as Request,
            r as unknown as Response
        )

        // Assert: 409 Conflict with a specific error code so the frontend
        // knows exactly why the check-in was rejected.
        expect(r.status).toHaveBeenCalledWith(409)
        expect(r.json).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'PERSON_ALREADY_IN_PLANT' })
        )
    })

    it('fails when main visitor and companion share the same badge number → 400', async () => {
        // Arrange: the main visitor has badge_number 'B001' and one of the
        // companions also has 'B001'. The handler must catch this before
        // writing anything to the DB.
        const mockVisit = { id: 1, visit_status_id: 1, update: jest.fn() }
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(mockVisit)
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })

        // Act
        const r = res()
        await checkIn(
            req({
                params: { id: '1' },
                body: {
                    ...validCheckIn,
                    companions: [{ visitor_person_id: 20, badge_number: 'B001' }], // duplicate badge
                },
            }) as Request,
            r as unknown as Response
        )

        // Assert: 400 with the DUPLICATE_BADGE_NUMBER code.
        expect(r.status).toHaveBeenCalledWith(400)
        expect(r.json).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'DUPLICATE_BADGE_NUMBER' })
        )
    })

    it('fails when the same person appears as both main visitor and companion → 400', async () => {
        // Arrange: the main visitor has visitor_person_id 10, and one of the
        // companions also has visitor_person_id 10 — the same person cannot
        // hold two roles in the same visit.
        const mockVisit = { id: 1, visit_status_id: 1, update: jest.fn() }
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(mockVisit)
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })

        // Act
        const r = res()
        await checkIn(
            req({
                params: { id: '1' },
                body: {
                    ...validCheckIn,
                    companions: [{ visitor_person_id: 10, badge_number: 'B002' }], // same id as main
                },
            }) as Request,
            r as unknown as Response
        )

        // Assert: 400 with the PERSON_DUPLICATE_ROLE code.
        expect(r.status).toHaveBeenCalledWith(400)
        expect(r.json).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'PERSON_DUPLICATE_ROLE' })
        )
    })

    it('fails when companions is not an array → 400', async () => {
        // Arrange: the client accidentally sends companions as a string
        // instead of an array. The handler must reject it early.
        const mockVisit = { id: 1, visit_status_id: 1, update: jest.fn() }
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(mockVisit)
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'PROGRAMADA' })

        // Act
        const r = res()
        await checkIn(
            req({
                params: { id: '1' },
                body: { ...validCheckIn, companions: 'not-an-array' },
            }) as Request,
            r as unknown as Response
        )

        // Assert: 400 before any DB write happens.
        expect(r.status).toHaveBeenCalledWith(400)
    })
})

// ── checkOut ───────────────────────────────────────────────────────────────────

describe('checkOut', () => {
    beforeEach(() => jest.clearAllMocks())

    it('performs check-out successfully → 200', async () => {
        // Arrange: the visit exists and can be updated.
        // The handler looks up the FINALIZADA status and sets it on the visit.
        const mockVisit = { id: 1, update: jest.fn().mockResolvedValue({ id: 1 }) }
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(mockVisit)
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 3, name: 'FINALIZADA' })

        // Act: provide exit_time as required.
        const r = res()
        await checkOut(
            req({ params: { id: '1' }, body: { exit_time: '2024-06-01T17:00:00Z' } }) as Request,
            r as unknown as Response
        )

        // Assert: 200 and the confirmation message.
        expect(r.status).toHaveBeenCalledWith(200)
        expect(r.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Check-out realizado correctamente' })
        )
    })

    it('fails when the visit does not exist → 404', async () => {
        // Arrange: the visit id does not exist in the DB.
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(null)

        // Act
        const r = res()
        await checkOut(
            req({ params: { id: '999' }, body: { exit_time: '...' } }) as Request,
            r as unknown as Response
        )

        // Assert: 404 Not Found.
        expect(r.status).toHaveBeenCalledWith(404)
    })

    it('fails when exit_time is missing → 400', async () => {
        // Arrange: the visit exists but the client forgot to send exit_time.
        ;(Visit.findByPk as jest.Mock).mockResolvedValue({ id: 1, update: jest.fn() })

        // Act: empty body.
        const r = res()
        await checkOut(
            req({ params: { id: '1' }, body: {} }) as Request,
            r as unknown as Response
        )

        // Assert: 400 Bad Request — the handler validates before writing.
        expect(r.status).toHaveBeenCalledWith(400)
    })
})

// ── cancelVisit ────────────────────────────────────────────────────────────────

describe('cancelVisit', () => {
    beforeEach(() => jest.clearAllMocks())

    it('cancels a visit → 200', async () => {
        // Arrange: the visit exists. The handler looks up the CANCELADA status
        // and updates the visit's status field to that id.
        const mockVisit = { id: 1, update: jest.fn().mockResolvedValue({ id: 1 }) }
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(mockVisit)
        ;(VisitStatus.findOne as jest.Mock).mockResolvedValue({ id: 4, name: 'CANCELADA' })

        // Act
        const r = res()
        await cancelVisit(req({ params: { id: '1' } }) as Request, r as unknown as Response)

        // Assert: 200 OK.
        expect(r.status).toHaveBeenCalledWith(200)
    })

    it('fails when the visit does not exist → 404', async () => {
        // Arrange: no record found for the given id.
        ;(Visit.findByPk as jest.Mock).mockResolvedValue(null)

        // Act
        const r = res()
        await cancelVisit(req({ params: { id: '999' } }) as Request, r as unknown as Response)

        // Assert: 404 Not Found.
        expect(r.status).toHaveBeenCalledWith(404)
    })
})
