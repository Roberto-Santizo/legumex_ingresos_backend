import { Table, Column, DataType, Model } from "sequelize-typescript";

@Table({
    tableName: 'people'
})

export default class People extends Model {

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
    declare document_photo_front: string

    @Column({
        type: DataType.TEXT,
    })
    declare document_photo_back: string

    @Column({
        type: DataType.STRING(100),
    })
    declare license_number: string
    
    @Column({
        type: DataType.TEXT,
    })
    declare license_photo: string
}