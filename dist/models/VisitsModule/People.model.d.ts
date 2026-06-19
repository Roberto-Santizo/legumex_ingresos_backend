import { Model } from "sequelize-typescript";
export default class People extends Model {
    name: string;
    document_number: string;
    document_photo_front: string;
    document_photo_back: string;
    license_number: string;
    license_photo: string;
}
