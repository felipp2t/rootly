export class FolderAlreadyExistsError extends Error {
  constructor() {
    super('Folder with the same name already exists in the same parent folder')
  }
}
