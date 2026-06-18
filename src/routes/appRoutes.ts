import { Router } from "express"

// AccessControl
import authRouter       from "./AccessControl/auth.routes"
import userRouter       from "./AccessControl/user.routes"
import roleRouter       from "./AccessControl/role.routes"
import permissionRouter from "./AccessControl/permission.routes"

// VisitsModule
import visitRouter          from "./VisitsModule/visit.routes"
import visitReportsRouter   from "./VisitsModule/visitReports.routes"
import visitCompanionRouter from "./VisitsModule/visitCompanion.routes"
import companyRouter        from "./VisitsModule/company.routes"
import companyPersonRouter  from "./VisitsModule/companyPerson.routes"
import departmentRouter     from "./VisitsModule/department.routes"
import agentRouter          from "./VisitsModule/agent.routes"
import peopleRouter         from "./VisitsModule/people.routes"

// EquipmentDeliveryModule
import equipmentRouter                    from "./EquipmentDeliveryModule/equipment.routes"
import employeeBenefitedRouter            from "./EquipmentDeliveryModule/EmployeeBenefited.routes"
import deliveryEquipmentTransactionRouter from "./EquipmentDeliveryModule/DeliveryEquipmentTransaction.routes"
import equipmentReportsRouter             from "./EquipmentDeliveryModule/equipmentReports.routes"

const appRouter = Router()

appRouter.use("/login",           authRouter)
appRouter.use("/user",            userRouter)
appRouter.use("/role",            roleRouter)
appRouter.use("/permissions",     permissionRouter)

appRouter.use("/visit",           visitRouter)
appRouter.use("/reports",         visitReportsRouter)
appRouter.use("/visit-companion", visitCompanionRouter)
appRouter.use("/company",         companyRouter)
appRouter.use("/company-person",  companyPersonRouter)
appRouter.use("/department",      departmentRouter)
appRouter.use("/agent",           agentRouter)
appRouter.use("/people",          peopleRouter)

appRouter.use("/equipment",                      equipmentRouter)
appRouter.use("/employee-benefited",             employeeBenefitedRouter)
appRouter.use("/delivery-equipment-transaction", deliveryEquipmentTransactionRouter)
appRouter.use("/equipment-reports",              equipmentReportsRouter)

export default appRouter
