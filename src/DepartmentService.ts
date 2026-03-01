import { DepartmentModel, IDepartment } from './Department.js';
import { Types } from 'mongoose';

export const departmentService = {

  // CREATE: Guardar el nuevo departamento
  async create(data: IDepartment): Promise<IDepartment> {
    const newDept = new DepartmentModel(data);
    return await newDept.save();
  },

  // GET BY ID: Devuelve con .populate() para ver los datos de la organización
  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;

    return await DepartmentModel.findById(id)
      .populate('organization') // REQUISITO: Sustituye el ID por el objeto de la empresa
      .exec();
  },

  // UPDATE: Modifica los datos del departamento
  async update(id: string, data: Partial<IDepartment>) {
    if (!Types.ObjectId.isValid(id)) return null;

    // Devuelve el objeto ya actualizado con { new: true } en vez del objeto antiguo
    return await DepartmentModel.findByIdAndUpdate(id, data, { new: true });
  },

  // DELETE: Elimina el departamento por su ID
  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return await DepartmentModel.findByIdAndDelete(id);
  },

  // LIST ALL: Devuelve todos los departamentos con .lean() para obtener objetos planos de JS
  async listAll() {
    // REQUISITO: .lean() para obtener objetos planos de JS en vez de documentos de Mongoose
    return await DepartmentModel.find().lean();
  }
};