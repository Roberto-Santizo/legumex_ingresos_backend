import { Model } from "sequelize-typescript";
import Role from "./Role.model";
declare class Permission extends Model {
    name: string;
    description: string;
    roles: Role[];
}
export default Permission;
