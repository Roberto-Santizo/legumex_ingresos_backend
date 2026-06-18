import server from "./server"
import { connectDB } from "./database/dbConnection"
import colors from 'colors'

const port = process.env.PORT || 4000

async function main() {
    await connectDB()
    server.listen(port, () => {
        console.log(colors.cyan.bold(`Rest API on the port ${port}`))
    })
}

main()
