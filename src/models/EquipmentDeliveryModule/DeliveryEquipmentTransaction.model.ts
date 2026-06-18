import { Table, Column,ForeignKey,DataType,Model, PrimaryKey, AutoIncrement, BelongsTo, Default } from "sequelize-typescript";
import User from "../AccessControl/User.model";
import EmployeeBenefited from "./EmployeeBenefited.model";
import EquipmentDeliveryDetails from "./EquipmentDeliveryDetails";

@Table({
    tableName: 'delivery_equipment_transaction'
})

export default class DeliveryEquipmentTransaction extends Model{

    @PrimaryKey
    @AutoIncrement
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare delivery_equipment_transaction_id: number

    @ForeignKey(() => EmployeeBenefited)
    @Column({
        allowNull: false,
        type: DataType.INTEGER,
    })
    declare employee_benefited_id: number

    @ForeignKey(()=> User)
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare delivered_by_user_id: number

    @ForeignKey(()=>EquipmentDeliveryDetails)
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare equipment_delivery_detail_id: number

    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    declare delivery_date: Date

    @Default(1)
    @Column({
        allowNull: false,
        type: DataType.INTEGER
    })
    declare delivery_batch_id: number

    @Column({
        allowNull: false,
        type: DataType.ENUM('DELIVERED', 'CHANGE') 
    })
    declare delivery_equipment_type: string

    @Column({
        type: DataType.BOOLEAN
    })
    declare is_paid: boolean

    @Column({
        allowNull: true,
        type: DataType.TEXT
    })
    declare delivery_photo_url: string

    @Column({
        allowNull: true,
        type: DataType.TEXT
    })
    declare delivery_notes: string


    @BelongsTo(() => EmployeeBenefited)
    declare employeeBenefited?: EmployeeBenefited

    @BelongsTo(() => User)
    declare deliveredBy?: User

    @BelongsTo(() => EquipmentDeliveryDetails)
    declare equipmentDetails?: EquipmentDeliveryDetails
}


