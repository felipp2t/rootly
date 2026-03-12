import { GetMeUseCase } from '@/domain/root/application/use-cases/get-me.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'

export function makeGetMeUseCase() {
  const userRepository = new DrizzleUserRepository(db)
  return new GetMeUseCase(userRepository)
}
