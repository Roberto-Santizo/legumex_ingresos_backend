import { Model } from "sequelize-typescript";
import User from "../AccessControl/User.model";
import Visit from "./Visit.model";
declare class Department extends Model {
    name: string;
    code: string;
    users: User[];
    visits: Visit[];
}
export default Department;
