import {Sequelize} from 'sequelize-typescript'
import dotenv from 'dotenv'
import { Role, User, Permission, RolePermission } from '../models/AccessControl'
import { Department, People, Agent, VisitStatus, Visit, VisitCompanion, Company, CompanyPerson } from '../models/VisitsModule'


//Importing Equipment Delivery Module Models
import Equipment from '../models/EquipmentDeliveryModule/Equipment.model'
import EmployeeBenefited from '../models/EquipmentDeliveryModule/EmployeeBenefited.model'
import EquipmentDeliveryDetails from '../models/EquipmentDeliveryModule/EquipmentDeliveryDetails'
import DeliveryEquipmentTransaction from '../models/EquipmentDeliveryModule/DeliveryEquipmentTransaction.model'

dotenv.config()

const db = new Sequelize(process.env.DATABASE_URL!,{
    models:[Role, User, Department, People, Agent, VisitStatus, Visit, VisitCompanion, Company, CompanyPerson, Permission, 
        RolePermission,Equipment, EquipmentDeliveryDetails, DeliveryEquipmentTransaction, EmployeeBenefited],
    logging: false,
    pool: {
        max: 5,
        min: 1,
        acquire: 30000,
        idle: 10000,
    },
})

export default db;