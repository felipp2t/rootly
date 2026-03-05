import { nanoid } from '@/infra/db/drizzle/helpers/nanoid.ts'

export class UniqueEntityID {
  private value: string

  toString() {
    return this.value
  }

  constructor(value?: string) {
    this.value = value ?? nanoid()
  }

  public equals(id: UniqueEntityID) {
    return id.toString() === this.value
  }
}
