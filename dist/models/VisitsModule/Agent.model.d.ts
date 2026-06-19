import { Model } from "sequelize-typescript";
import Visit from "./Visit.model";
declare class Agent extends Model {
    name: string;
    visits: Visit[];
}
export default Agent;
