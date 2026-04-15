import {Sequelize} from 'sequelize-typescript'
import dotenv from 'dotenv'
import Role from '../models/Role.model'
import User from '../models/User.model'
import Department from '../models/Department.model'
import People from '../models/People.model'
import Agent from '../models/Agent.model'
import VisitStatus from '../models/Visit_status.model'
import Visit from '../models/Visit.model'
import VisitCompanion from '../models/VisitCompanion.model'
import Company from '../models/Company.model'
import CompanyPerson from '../models/CompanyPerson.model'
import Permission from '../models/Permission.model'
import RolePermission from '../models/RolePermission.model'

dotenv.config()

const db = new Sequelize(process.env.DATABASE_URL!,{
    models:[Role, User, Department, People, Agent, VisitStatus, Visit, VisitCompanion, Company, CompanyPerson, Permission, RolePermission],
    logging: false,
    pool: {
        max: 5,
        min: 1,
        acquire: 30000,
        idle: 10000,
    },
})

export default db;