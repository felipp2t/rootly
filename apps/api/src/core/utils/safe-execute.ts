import type { BaseError } from '../errors/base-error.ts'
import { type Either, left, right } from '../types/either.ts'

export async function safeEither<T>(
  fn: () => T | Promise<T>,
): Promise<Either<BaseError, T>> {
  try {
    return right(await fn())
  } catch (error) {
    return left(error as BaseError)
  }
}
