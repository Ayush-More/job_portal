import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  // Change these values as needed
  const email = process.env.ADMIN_EMAIL || 'admin@ittihad.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin123!@#'
  const name = process.env.ADMIN_NAME || 'Admin User'

  console.log('Creating admin user...')
  console.log('Email:', email)
  console.log('Name:', name)

  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      if (existing.role === 'ADMIN') {
        console.log('✅ Admin user already exists!')
        console.log('Email:', existing.email)
        console.log('ID:', existing.id)
        return
      } else {
        console.log('⚠️  User exists but is not an admin. Updating role...')
        const updated = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        })
        console.log('✅ User role updated to ADMIN!')
        console.log('Email:', updated.email)
        console.log('ID:', updated.id)
        return
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        emailVerified: new Date(), // Mark as verified so they can login immediately
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', admin.email)
    console.log('ID:', admin.id)
    console.log('\n📝 You can now login with:')
    console.log('   Email:', email)
    console.log('   Password:', password)
    console.log('\n⚠️  Please change the password after first login!')
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message)
    if (error.code === 'P2002') {
      console.error('   A user with this email already exists')
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

