import { Model } from "sequelize-typescript";
import Equipment from "./Equipment.model";
import DeliveryEquipmentTransaction from "./DeliveryEquipmentTransaction.model";
export default class EquipmentDeliveryDetails extends Model {
    equipment_delivery_detail_id: number;
    equipment_id: number;
    equipment?: Equipment;
    equipment_condition: string;
    transactions: DeliveryEquipmentTransaction[];
}
