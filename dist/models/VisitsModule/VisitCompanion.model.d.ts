import { Model } from "sequelize-typescript";
import Visit from "./Visit.model";
import CompanyPerson from "./CompanyPerson.model";
export default class VisitCompanion extends Model {
    visit_id: number;
    visit: Visit;
    company_person_id: number;
    company_person: CompanyPerson;
    badge_number: string;
}
