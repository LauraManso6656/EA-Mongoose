import { Schema, model, Types } from 'mongoose';
import { IOrganization } from './organization.js'; // Importar la interfaz de la organización para el tipo del campo 'organization'

export interface IDepartment {
  _id?: any; //  any para evitar conflictos de tipos en los tests (ia me sugirió usar any porque string me daba error)
  name: string;
  code: string;
  organization: Types.ObjectId | IOrganization | any; 
}

const departmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
});

export const DepartmentModel = model<IDepartment>('Department', departmentSchema);