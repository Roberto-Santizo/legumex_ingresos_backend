import { Table,Column, DataType, Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import Company from "./Company.model";

@Table({
    tableName: 'people'
})

export default class People extends Model {

    @ForeignKey(() => Company)
    @Column({
        type: DataType.INTEGER,
    })
    declare company_id: number

    @BelongsTo(() => Company)
    company: Company

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare name: string

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true,
    })
    declare document_number: string

    @Column({
        type: DataType.TEXT,
    })
    declare document_photo: string

    @Column({
        type: DataType.STRING(100),
    })
    declare license_number: string
    
    @Column({
        type: DataType.TEXT,
    })
    declare license_photo: string
}