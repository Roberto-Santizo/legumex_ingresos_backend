import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import Visit from "./Visit.model";

@Table({
    tableName: 'agent'
})

class Agent extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare name: string
    @HasMany(() => Visit)
    visits: Visit[]
}

export default Agent;