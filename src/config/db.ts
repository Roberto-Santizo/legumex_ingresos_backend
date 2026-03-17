import {Sequelize} from 'sequelize-typescript'
import dotenv from 'dotenv'
import Role from '../models/Role.model'
import User from '../models/User.model'
import Department from '../models/Department.model'
import People from '../models/People.model'
import Company from '../models/Company.model'
import Agent from '../models/Agent.model'
import VisitStatus from '../models/Visit_status.model'
import Visit from '../models/Visit.model'
import Companion from '../models/Companion.model'
import VisitCompanion from '../models/VisitCompanion.model'
import Visitor from '../models/Visitor.model'
import VisitorPerson from '../models/VisitorPerson.model'

dotenv.config()

const db = new Sequelize(process.env.DATABASE_URL!,{
    models:[Role, User, Department, People, Company, Agent, VisitStatus, Visit, Companion, VisitCompanion, Visitor, VisitorPerson],
    logging: false
})

export default db;