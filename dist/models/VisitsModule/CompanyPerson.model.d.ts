import { Model } from "sequelize-typescript";
import Company from "./Company.model";
import VisitCompanion from "./VisitCompanion.model";
export default class CompanyPerson extends Model {
    company_id: number;
    company: Company;
    name: string;
    document_number: string;
    document_photo_front: string;
    document_photo_back: string;
    license_number: string;
    license_photo: string;
    visit_companions: VisitCompanion[];
}
