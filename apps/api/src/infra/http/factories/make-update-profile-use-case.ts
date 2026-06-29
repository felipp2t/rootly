import { UpdateProfileUseCase } from '@/domain/root/application/use-cases/update-profile.ts'
import { db } from '@/infra/db/drizzle/index.ts'
import { DrizzleUserRepository } from '@/infra/db/drizzle/repositories/user-respository.ts'

export function makeUpdateProfileUseCase() {
  const userRepository = new DrizzleUserRepository(db)
  return new UpdateProfileUseCase(userRepository)
}
