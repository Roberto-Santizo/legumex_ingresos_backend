import { Model } from "sequelize-typescript";
import CompanyPerson from "./CompanyPerson.model";
export default class Company extends Model {
    name: string;
    created_by: string | null;
    company_persons: CompanyPerson[];
}
