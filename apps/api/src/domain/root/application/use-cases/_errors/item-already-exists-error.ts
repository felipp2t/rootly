export class ItemAlreadyExistsError extends Error {
  constructor() {
    super('Item with the same name already exists in the same parent folder')
  }
}
