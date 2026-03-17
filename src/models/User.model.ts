import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Role from './Role.model'
import Department from './Department.model'

@Table({
    tableName: 'users'
})

class User extends Model {
    @Column({
        type: DataType.STRING(100),
    })
    declare name: string

    @Column({
        type: DataType.STRING,
        unique: true
    })
    declare username: string

    @Column({
        type: DataType.STRING,
    })
    declare password: string

    @ForeignKey(() => Role)
    @Column({
        type: DataType.INTEGER,
    })
    declare role_id: number

    @BelongsTo(() => Role)
    declare role: Role

    @ForeignKey(() => Department)
    @Column({
        type: DataType.INTEGER,
    })
    declare department_id: number

    @BelongsTo(() => Department)
    declare department: Department
}

export default User;