import express from "express"
import cors from "cors"
import db from "./config/db"
import colors from "colors"
import VisitStatus from "./models/Visit_status.model"
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

server.get("/", (req, res) => {
    res.json({message:"From Api"})
})

export default server