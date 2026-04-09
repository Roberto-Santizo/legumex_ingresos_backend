import { Table, Column, DataType, Model } from "sequelize-typescript";

@Table({
    tableName: 'companion_people'
})

export default class Companion extends Model {

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare full_name: string

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true,
    })
    declare document_number: string

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare document_photo: string

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    declare license_number: string

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare license_photo: string
}
