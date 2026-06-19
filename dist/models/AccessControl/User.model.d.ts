import { Model } from 'sequelize-typescript';
import Role from './Role.model';
import Department from '../VisitsModule/Department.model';
declare class User extends Model {
    name: string;
    username: string;
    password: string;
    role_id: number;
    role: Role;
    department_id: number;
    department: Department;
    failed_attempts: number;
    locked_until: Date | null;
}
export default User;
