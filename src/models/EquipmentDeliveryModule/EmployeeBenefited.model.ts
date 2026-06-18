import { Column, Table, DataType, Model, HasMany, PrimaryKey, AutoIncrement, Unique, Default } from "sequelize-typescript";
import DeliveryEquipmentTransaction from "./DeliveryEquipmentTransaction.model";

export enum EmployeeBenefitedStatus {
    DELIVER_EQUIPMENT = 'DELIVER_EQUIPMENT',
    FINAL_PHOTO        = 'FINAL_PHOTO',
    COMPLETED          = 'COMPLETED',
}

@Table({ tableName: 'employee_benefited' })
export default class EmployeeBenefited extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column({ type: DataType.INTEGER })
    declare employee_benefited_id: number

    @Unique
    @Column({ type: DataType.STRING(100), allowNull: false })
    declare external_id: string

    @Column({ type: DataType.STRING(150) })
    declare employee_name: string

    @Column({ type: DataType.STRING(50) })
    declare employee_code: string

    @Column({ type: DataType.STRING(100) })
    declare employee_position: string

    @Column({ type: DataType.STRING(150) })
    declare department_name: string

    @Column({ type: DataType.STRING(500), allowNull: true })
    declare photo_url: string | null

    @Default(EmployeeBenefitedStatus.DELIVER_EQUIPMENT)
    @Column({ type: DataType.ENUM(...Object.values(EmployeeBenefitedStatus)), allowNull: false })
    declare status: EmployeeBenefitedStatus

    @HasMany(() => DeliveryEquipmentTransaction, 'employee_benefited_id')
    declare transactions?: DeliveryEquipmentTransaction[]
}