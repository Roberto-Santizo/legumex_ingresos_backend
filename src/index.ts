import server from "./server"
import { connectDB } from "./database/dbConnection"
import db from "./config/db"
import { closeExpiredTempExits } from "./handlers/VisitsModule/visit"
import { cyan } from 'colors'

const port = process.env.PORT || 4000

// Cada minuto: finaliza automáticamente las visitas con salida temporal cuyo plazo de regreso venció
const TEMP_EXIT_CHECK_INTERVAL_MS = 60 * 1000

async function main() {
    await connectDB()
    server.listen(port, () => {
        console.log(cyan.bold(`Rest API on the port ${port}`))
    })
    setInterval(() => { closeExpiredTempExits() }, TEMP_EXIT_CHECK_INTERVAL_MS)
}

main().catch(async (error) => {
    console.error("No se pudo iniciar el servidor:", error)
    process.exitCode = 1
    try {
        await db.close()
    } catch (closeError) {
        console.error("Error al cerrar la conexión de base de datos:", closeError)
    }
})
