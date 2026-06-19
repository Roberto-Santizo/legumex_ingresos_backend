import express from "express"
import cors from "cors"
import appRouter from "./routes/appRoutes"

const server = express()

server.set("trust proxy", 1)

server.use(cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173"
}))
server.use(express.json({ limit: '100mb' }))

server.use("/api", appRouter)

server.get("/", (req, res) => {
    res.json({message:"From Api"})
})

export default server
