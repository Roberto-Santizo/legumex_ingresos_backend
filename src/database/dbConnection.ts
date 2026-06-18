import colors from "colors"
import db from "../config/db"
import { runSeeders } from "./seeder"

export async function connectDB() {
    try {
        await db.authenticate()
        await db.sync({ alter: { drop: false } })
        // Asegurar que companion_id sea nullable (columna legada, ya no se usa)
        await db.query('ALTER TABLE visit_companions ALTER COLUMN companion_id DROP NOT NULL').catch(() => {})
        await db.query('ALTER TABLE delivery_equipment_transaction ALTER COLUMN delivery_photo_url TYPE TEXT').catch(() => {})
        await runSeeders()
        console.log(colors.blue("Successfully connection to the database"))
    } catch (error) {
        console.log(error)
        console.log(colors.bgRed.white("There was an error connecting to the database"))
    }
}
