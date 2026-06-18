import { Table, Column, DataType, PrimaryKey, AutoIncrement,Model, ForeignKey, HasMany, BelongsTo } from "sequelize-typescript";
import Equipment from "./Equipment.model";
import DeliveryEquipmentTransaction from "./DeliveryEquipmentTransaction.model";

@Table({
  tableName: 'delivery_equipment'
})

export default class EquipmentDeliveryDetails extends Model{
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER
    })
    declare equipment_delivery_detail_id: number

    @ForeignKey(() => Equipment)
    @Column({
        type: DataType.INTEGER
    })
    declare equipment_id: number

    @BelongsTo(() => Equipment)
    declare equipment?: Equipment

    @Column({
        type: DataType.ENUM('NEW', 'USED')
    })
    declare equipment_condition: string

    @HasMany(()=>DeliveryEquipmentTransaction,'equipment_delivery_detail_id')
    declare transactions: DeliveryEquipmentTransaction[]

}