import { z } from 'zod'
import { createManagedUser, getDb } from '../database'

const argsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
})

function readFlag(flag: string) {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : undefined
}

getDb()

const payload = argsSchema.parse({
  email: readFlag('--email'),
  password: readFlag('--password'),
  displayName: readFlag('--display-name'),
})

const user = createManagedUser({
  email: payload.email,
  password: payload.password,
  displayName: payload.displayName,
  role: 'admin',
})

console.log(
  `Создан администратор: ${user.display_name} <${user.email}> (${user.role})`,
)
