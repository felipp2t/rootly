import { Entity } from '@/core/entities/entity.ts'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.ts'
import type { Optional } from '@/core/types/optional.ts'

export interface UserProps {
  email: string
  name: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export class User extends Entity<UserProps> {
  get email() {
    return this.props.email
  }

  get name() {
    return this.props.name
  }

  set name(value: string) {
    this.props.name = value
    this.touch()
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  set passwordHash(value: string) {
    this.props.passwordHash = value
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<UserProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    return new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id ?? new UniqueEntityID(crypto.randomUUID()),
    )
  }
}
