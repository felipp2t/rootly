export class InvalidFolderNameError extends Error {
  constructor(message?: string) {
    super(
      message ??
        'Invalid folder name. Folder name must be between 3 and 32 characters long.',
    )
  }
}
