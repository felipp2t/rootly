export class InvalidItemTitleError extends Error {
  constructor(message?: string) {
    super(
      message ??
        'Invalid item title. Item title must be between 3 and 32 characters long.',
    )
  }
}
