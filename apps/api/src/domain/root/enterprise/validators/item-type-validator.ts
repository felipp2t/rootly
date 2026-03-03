import type { ItemType } from "../entities/item.ts"
import { InvalidItemTypeError } from "./_errors/invalid-item-type.ts"

const allowedTypes: ItemType[] = ['link', 'document', 'secret', 'text']

export function validateTypeAndContent(
  type: ItemType,
  content?: string,
): void {
  if (!allowedTypes.includes(type)) {
    throw new InvalidItemTypeError('Invalid item type')
  }

  const trimmedContent = content?.trim()

  switch (type) {
    case 'link': {
      if (!trimmedContent) {
        throw new InvalidItemTypeError('Link requires content')
      }

      try {
        const url = new URL(trimmedContent)

        if (url.protocol !== 'https:') {
          throw new InvalidItemTypeError('Link must use HTTPS')
        }
      } catch {
        throw new InvalidItemTypeError('Invalid URL format')
      }

      if (trimmedContent.length > 2048) {
        throw new InvalidItemTypeError('URL too long')
      }

      break
    }

    case 'document': {
      if (!trimmedContent) {
        throw new InvalidItemTypeError('Document requires content')
      }

      if (trimmedContent.length > 50_000) {
        throw new InvalidItemTypeError('Document too large')
      }

      break
    }

    case 'secret': {
      if (!trimmedContent) {
        throw new InvalidItemTypeError('Secret requires content')
      }

      if (trimmedContent.length < 8) {
        throw new InvalidItemTypeError(
          'Secret must be at least 8 characters',
        )
      }

      break
    }
    default: break
  }
}
