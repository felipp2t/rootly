export class InvalidItemTypeError extends Error {
  constructor(message?: string) {
    super(message ?? 'Invalid item type')
  }
}
