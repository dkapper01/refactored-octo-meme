import { PrismaClient } from '@prisma/client'
import { execaCommand } from 'execa'

const datasourceUrl = 'file:./tmp.ignored.db'
console.time('🗄️ Created database...')
await execaCommand('npx prisma migrate deploy', {
	stdio: 'inherit',
	env: { DATABASE_URL: datasourceUrl },
})
console.timeEnd('🗄️ Created database...')

const prisma = new PrismaClient({ datasourceUrl })

console.time('🔑 Created permissions...')
const entities = ['user', 'note', 'meetup']
const actions = ['create', 'read', 'update', 'delete']
const accesses = ['own', 'any']

for (const entity of entities) {
	for (const action of actions) {
		for (const access of accesses) {
			await prisma.permission.upsert({
				where: {
					action_entity_access: {
						action,
						entity,
						access,
					},
				},
				update: {},
				create: { entity, action, access },
			})
		}
	}
}
console.timeEnd('🔑 Created permissions...')

console.time('👑 Created roles...')
await prisma.role.upsert({
	where: { name: 'admin' },
	update: {
		permissions: {
			connect: await prisma.permission.findMany({
				select: { id: true },
				where: { access: 'any' },
			}),
		},
	},
	create: {
		name: 'admin',
		permissions: {
			connect: await prisma.permission.findMany({
				select: { id: true },
				where: { access: 'any' },
			}),
		},
	},
})

await prisma.role.upsert({
	where: { name: 'user' },
	update: {
		permissions: {
			connect: await prisma.permission.findMany({
				select: { id: true },
				where: { access: 'own' },
			}),
		},
	},
	create: {
		name: 'user',
		permissions: {
			connect: await prisma.permission.findMany({
				select: { id: true },
				where: { access: 'own' },
			}),
		},
	},
})
console.timeEnd('👑 Created roles...')

await prisma.$disconnect()
console.log('✅ all done')
