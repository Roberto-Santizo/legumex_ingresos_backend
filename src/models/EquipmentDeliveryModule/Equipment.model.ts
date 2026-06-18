import { Table, Column, Model, DataType, AutoIncrement, PrimaryKey, HasMany } from "sequelize-typescript";
import EquipmentDeliveryDetails from "./EquipmentDeliveryDetails";

@Table({
  tableName: 'equipment'  
})

export default class Equipment extends Model{

    @PrimaryKey
    @AutoIncrement
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare equipment_id: number

    @Column({
        allowNull: false,
        type: DataType.STRING(100)
    })
    declare equipment_name: string

    @Column({
        allowNull: true,
        type: DataType.STRING(100)
    })
    declare equipment_description: string

    @Column({
        allowNull: false,
        type: DataType.STRING(100),
    })
    declare created_by: string

    @HasMany(()=> EquipmentDeliveryDetails)
    declare deliveryDetails: EquipmentDeliveryDetails[]
}