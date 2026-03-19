import express from "express"
import cors from "cors"
import db from "./config/db"
import colors from "colors"
import bcrypt from "bcrypt"
import VisitStatus from "./models/Visit_status.model"
import Permission from "./models/Permission.model"
import RolePermission from "./models/RolePermission.model"
import Role from "./models/Role.model"
import User from "./models/User.model"
import Department from "./models/Department.model"
import authRouter           from "./routes/auth.routes"
import userRouter           from "./routes/user.routes"
import visitRouter          from "./routes/visit.routes"
import roleRouter           from "./routes/role.routes"
import agentRouter          from "./routes/agent.routes"
import visitorRouter        from "./routes/visitor.routes"
import visitorPersonRouter  from "./routes/visitorPerson.routes"
import departmentRouter     from "./routes/department.routes"
import visitCompanionRouter from "./routes/visitCompanion.routes"
import visitReportsRouter   from "./routes/visitReports.routes"
import permissionRouter     from "./routes/permission.routes"

const PERMISSIONS = [
    { name: 'users:view',         description: 'Ver usuarios' },
    { name: 'users:create',       description: 'Crear usuarios' },
    { name: 'users:edit',         description: 'Editar usuarios' },
    { name: 'roles:view',         description: 'Ver roles' },
    { name: 'roles:create',       description: 'Crear roles' },
    { name: 'roles:edit',         description: 'Editar roles' },
    { name: 'agents:view',        description: 'Ver agentes' },
    { name: 'agents:create',      description: 'Crear agentes' },
    { name: 'agents:edit',        description: 'Editar agentes' },
    { name: 'companies:view',     description: 'Ver empresas' },
    { name: 'companies:create',   description: 'Crear empresas' },
    { name: 'companies:edit',     description: 'Editar empresas' },
    { name: 'departments:view',   description: 'Ver departamentos' },
    { name: 'departments:create', description: 'Crear departamentos' },
    { name: 'departments:edit',   description: 'Editar departamentos' },
    { name: 'visitors:view',      description: 'Ver visitantes' },
    { name: 'visitors:create',    description: 'Crear visitantes' },
    { name: 'visitors:edit',      description: 'Editar visitantes' },
    { name: 'visits:view',        description: 'Ver visitas propias' },
    { name: 'visits:view:all',    description: 'Ver todas las visitas' },
    { name: 'visits:create',      description: 'Crear visitas' },
    { name: 'visits:checkin',     description: 'Registrar entrada de visitas' },
    { name: 'visits:checkout',    description: 'Registrar salida de visitas' },
    { name: 'visits:cancel',      description: 'Cancelar visitas' },
    { name: 'reports:view',       description: 'Ver reportes' },
]

async function seedAdmin() {
    // 1. Departamento por defecto
    const [department] = await Department.findOrCreate({
        where: { code: 'ADMIN' },
        defaults: { name: 'Administración', code: 'ADMIN' }
    })

    // 2. Rol Administrador
    const [adminRole] = await Role.findOrCreate({
        where: { name: 'Administrador' },
        defaults: { name: 'Administrador' }
    })

    // 3. Asignar TODOS los permisos al rol Administrador
    const allPermissions = await Permission.findAll()
    const existingRolePerms = await RolePermission.findAll({ where: { role_id: adminRole.id } })
    const existingPermIds = new Set(existingRolePerms.map(rp => rp.permission_id))
    const missing = allPermissions.filter(p => !existingPermIds.has(p.id))
    if (missing.length > 0) {
        await RolePermission.bulkCreate(
            missing.map(p => ({ role_id: adminRole.id, permission_id: p.id }))
        )
    }

    // 4. Usuario Luis (solo se crea si no existe)
    const existingUser = await User.findOne({ where: { username: 'Luis' } })
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('Admin123!', 10)
        await User.create({
            name: 'Luis',
            username: 'Luis',
            password: hashedPassword,
            role_id: adminRole.id,
            department_id: department.id
        })
        console.log(colors.green('✔ Usuario administrador creado: Luis / Admin123!'))
    }
}

async function connectDB() {
    try {
        await db.authenticate()
        await db.sync({ alter: { drop: false } })
        // Asegurar que companion_id sea nullable (columna legada, ya no se usa)
        await db.query('ALTER TABLE visit_companions ALTER COLUMN companion_id DROP NOT NULL').catch(() => {})
        await VisitStatus.bulkCreate(
            [
                { name: 'PROGRAMADA' },
                { name: 'EN PLANTA' },
                { name: 'FINALIZADA' },
                { name: 'CANCELADA' },
            ],
            { ignoreDuplicates: true }
        )
        await Permission.bulkCreate(PERMISSIONS, { ignoreDuplicates: true })
        await seedAdmin()
        console.log(colors.blue("Successfully connection to the database"))
    } catch (error) {
        console.log(error)
        console.log(colors.bgRed.white("There was an error connecting to the database"))
    }
}

connectDB()

const server = express()

server.use(cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173"
}))
server.use(express.json({ limit: '20mb' }))

server.use("/api/login",            authRouter)
server.use("/api/user",             userRouter)
server.use("/api/visit",            visitRouter)
server.use("/api/role",             roleRouter)
server.use("/api/agent",            agentRouter)
server.use("/api/visitor",          visitorRouter)
server.use("/api/visitor-person",   visitorPersonRouter)
server.use("/api/department",       departmentRouter)
server.use("/api/visit-companion",  visitCompanionRouter)
server.use("/api/reports",          visitReportsRouter)
server.use("/api/permissions",      permissionRouter)

server.get("/", (req, res) => {
    res.json({message:"From Api"})
})

export default server
