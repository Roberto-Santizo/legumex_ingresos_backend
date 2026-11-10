import type { Request, Response } from 'express'
import { Model, Sequelize } from 'sequelize-typescript'
import type { ModelCtor } from 'sequelize-typescript'
import * as models from '../models'
import { CompanyPerson } from '../models/VisitsModule'
import { getCompanyPersonsByCompany } from '../handlers/VisitsModule/companyPerson'

// Usar el ORM real para comprobar el SQL que llega a PostgreSQL, sin conectar a la BD.
const database = new Sequelize({
    dialect: 'postgres',
    logging: false,
    models: Object.values(models).filter(value =>
        typeof value === 'function' && value.prototype instanceof Model
    ) as ModelCtor[],
})

function response() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    }
}

afterEach(() => jest.restoreAllMocks())
afterAll(async () => database.close())

it('selects only the fields used by the form and filters using the physical company column', async () => {
    const people = [
        { id: 12, name: 'ANA', document_number: '1234567890101' },
        { id: 18, name: 'LUIS', document_number: '9876543210101' },
    ]
    const query = jest.spyOn(database, 'query').mockResolvedValue(people as any)
    const res = response()

    await getCompanyPersonsByCompany(
        { params: { company_id: '7' } } as unknown as Request,
        res as unknown as Response,
    )

    expect(query).toHaveBeenCalledTimes(1)
    const sql = query.mock.calls[0][0] as string
    expect(sql).toMatch(/^SELECT "id", "name", "document_number" FROM "company_person"/)
    expect(sql).toContain('"visitor_id" = 7')
    expect(sql).toMatch(/ORDER BY .*"name" ASC/)
    expect(sql).not.toMatch(/photo|SELECT \*/i)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ data: people })
})

it('returns an empty list for a company without people', async () => {
    jest.spyOn(database, 'query').mockResolvedValue([] as any)
    const res = response()

    await getCompanyPersonsByCompany(
        { params: { company_id: '7' } } as unknown as Request,
        res as unknown as Response,
    )

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ data: [] })
})

it('defines the company and name index on the physical database columns', () => {
    expect(CompanyPerson.options.indexes).toEqual(expect.arrayContaining([
        expect.objectContaining({
            name: 'company_person_company_name_idx',
            fields: ['visitor_id', 'name'],
        }),
    ]))
})
