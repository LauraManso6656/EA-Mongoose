import mongoose from 'mongoose';
import { UserModel } from './user.js';
import { OrganizationModel } from './organization.js';
import { DepartmentModel } from './Department.js'; // Nueva importación
import { departmentService } from './DepartmentService.js'; // El servicio que creamos
async function runDemo() {
    try {
        // --- 1. CONNECTION ---
        await mongoose.connect('mongodb://127.0.0.1:27017/ea_mongoose');
        console.log('🚀 Connected to MongoDB');
        // --- 2. CLEANING (Idempotency) ---
        console.log('🧹 Cleaning database...');
        await UserModel.deleteMany({});
        await OrganizationModel.deleteMany({});
        await DepartmentModel.deleteMany({}); // Limpiamos también la nueva colección
        // --- 3. SEEDING ---
        console.log('🌱 Seeding data...');
        const orgs = await OrganizationModel.insertMany([
            { name: 'Initech', country: 'USA' },
            { name: 'Umbrella Corp', country: 'UK' }
        ]);
        const initechId = orgs[0]._id;
        const umbrellaId = orgs[1]._id;
        // --- 4. NUEVA SECCIÓN: DEPARTMENT SERVICE DEMO ---
        console.log('\n DEPARTMENT SERVICE DEMO:');
        // 4.1 CREATE (usando el servicio)
        const dept1 = await departmentService.create({
            name: 'Software Engineering',
            code: 'IT-01',
            organization: initechId
        });
        const dept2 = await departmentService.create({
            name: 'Biological Research',
            code: 'BIO-01',
            organization: umbrellaId
        });
        console.log(`Created Departments: ${dept1.name}, ${dept2.name}`);
        // 4.2 LIST ALL (usando .lean())
        // Requisito: Llista tots els documents usant .lean()
        const allDepts = await departmentService.listAll();
        console.log('All Departments:', allDepts);
        // 4.3 GET BY ID (con .populate())
        // Requisito: Retorna amb el seu populate de la col·lecció enllaçada
        const deptWithOrg = await departmentService.getById(dept1._id.toString());
        console.log(' Detailed Department (Populated):');
        console.log(`- Dept: ${deptWithOrg?.name}`);
        // con populate podemos acceder a los datos de la organización directamente sin hacer otra consulta
        const orgInfo = deptWithOrg?.organization;
        console.log(`- Belongs to Org: ${orgInfo?.name} (${orgInfo?.country})`);
        // 4.4 UPDATE
        const updatedDept = await departmentService.update(dept1._id.toString(), { name: 'Fullstack Devs' });
        console.log(`Updated Dept Name: ${updatedDept?.name}`);
        // 4.5 DELETE (Opcional mostrarlo)
        // await departmentService.delete(dept2._id!.toString());
        // console.log(' Deleted Research Dept');
        // --- 5. SEEDING USERS (Para mantener tu código original) ---
        const usersData = [
            { name: 'Bill', email: 'bill@initech.com', role: 'ADMIN', organization: initechId },
            { name: 'Alice', email: 'alice@umbrella.com', role: 'EDITOR', organization: umbrellaId }
        ];
        await UserModel.insertMany(usersData);
        console.log(`\n✅ Seeded ${usersData.length} users`);
        // --- 6. AGGREGATION (Tu código original modificado para el log) ---
        console.log('\n📊 AGGREGATION STATS:');
        const stats = await UserModel.aggregate([
            { $group: { _id: '$organization', totalUsers: { $sum: 1 } } },
            { $lookup: { from: 'organizations', localField: '_id', foreignField: '_id', as: 'org' } },
            { $project: { orgName: { $arrayElemAt: ['$org.name', 0] }, totalUsers: 1 } }
        ]);
        console.table(stats);
    }
    catch (err) {
        console.error('❌ Error:', err);
    }
    finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected');
    }
}
runDemo();
