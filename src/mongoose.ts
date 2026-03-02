import mongoose from 'mongoose';
import { UserModel } from './user.js';
import { OrganizationModel, IOrganization } from './organization.js';
import { DepartmentModel } from './Department.js'; 
import { departmentService } from './DepartmentService.js'; 

async function runDemo() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ea_mongoose');
        console.log('🚀 Connected to MongoDB');

        console.log('🧹 Cleaning database...');
        await UserModel.deleteMany({});
        await OrganizationModel.deleteMany({});
        await DepartmentModel.deleteMany({});

        console.log('🌱 Seeding data...');
        const orgs = await OrganizationModel.insertMany([
            { name: 'Initech', country: 'USA' },
            { name: 'Umbrella Corp', country: 'UK' }
        ]);

        
        const initechId = orgs[0]._id as any;
        const umbrellaId = orgs[1]._id as any;

        console.log('\n DEPARTMENT SERVICE DEMO:');

        // 4.1 CREATE
        const dept1 = await departmentService.create({
            name: 'Software Engineering',
            code: 'IT-01',
            organization: initechId
        } as any); 

        const dept2 = await departmentService.create({
            name: 'Biological Research',
            code: 'BIO-01',
            organization: umbrellaId
        } as any);

        console.log(` Created Departments: ${dept1.name}, ${dept2.name}`);
        //4.2 LIST ALL
        const allDepts = await departmentService.listAll();
        console.log(' All Departments (Lean objects):', allDepts);

        // 4.3 GET BY ID (Populate)
       
        const deptWithOrg = await departmentService.getById(dept1._id!.toString());
        
        console.log(' Detailed Department (Populated):');
        console.log(`- Dept: ${deptWithOrg?.name}`);

       
        const orgInfo = deptWithOrg?.organization as unknown as IOrganization;
        
        if (orgInfo) {
            console.log(`- Belongs to Org: ${orgInfo.name} (${orgInfo.country})`);
        }

        // 4.4 UPDATE
        const updatedDept = await departmentService.update(dept1._id!.toString(), { name: 'Fullstack Devs' });
        console.log(` Updated Dept Name: ${updatedDept?.name}`);

        //4.5 DELETE
        await departmentService.delete(dept2._id!.toString());
        console.log(` Deleted Department: ${dept2.name}`);
        

        // --- 5. USERS ---
        const usersData = [
            { name: 'Bill', email: 'bill@initech.com', role: 'ADMIN', organization: initechId },
            { name: 'Alice', email: 'alice@umbrella.com', role: 'EDITOR', organization: umbrellaId }
        ];
        await UserModel.insertMany(usersData);
        console.log(`\n✅ Seeded users`);

        console.log('\n📊 AGGREGATION STATS:');
        const stats = await UserModel.aggregate([
            { $group: { _id: '$organization', totalUsers: { $sum: 1 } } },
            { $lookup: { from: 'organizations', localField: '_id', foreignField: '_id', as: 'org' } },
            { $project: { orgName: { $arrayElemAt: ['$org.name', 0] }, totalUsers: 1 } }
        ]);
        console.table(stats);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected');
    }
}
runDemo();