import { describe, it, expect } from 'vitest'
import { validateTypeAndContent } from './item-type-validator.ts'
import { InvalidItemTypeError } from './_errors/invalid-item-type.ts'

describe('ItemTypeValidator', () => {
  describe('invalid type', () => {
    it('should throw if type is invalid', () => {
      expect(() =>
        validateTypeAndContent('invalid' as any, 'content'),
      ).toThrow(InvalidItemTypeError)
    })
  })

  describe('link type', () => {
    it('should throw if content is missing', () => {
      expect(() =>
        validateTypeAndContent('link', undefined),
      ).toThrow(InvalidItemTypeError)
    })

    it('should throw if url is invalid', () => {
      expect(() =>
        validateTypeAndContent('link', 'not-a-url'),
      ).toThrow(InvalidItemTypeError)
    })

    it('should throw if not https', () => {
      expect(() =>
        validateTypeAndContent('link', 'http://example.com'),
      ).toThrow(InvalidItemTypeError)
    })

    it('should not throw for valid https url', () => {
      expect(() =>
        validateTypeAndContent('link', 'https://example.com'),
      ).not.toThrow()
    })
  })

  describe('document type', () => {
    it('should throw if content is missing', () => {
      expect(() =>
        validateTypeAndContent('document', undefined),
      ).toThrow(InvalidItemTypeError)
    })

    it('should throw if document is too large', () => {
      const big = 'a'.repeat(50_001)

      expect(() =>
        validateTypeAndContent('document', big),
      ).toThrow(InvalidItemTypeError)
    })

    it('should not throw for valid document', () => {
      expect(() =>
        validateTypeAndContent('document', 'some content'),
      ).not.toThrow()
    })
  })

  describe('secret type', () => {
    it('should throw if content is missing', () => {
      expect(() =>
        validateTypeAndContent('secret', undefined),
      ).toThrow(InvalidItemTypeError)
    })

    it('should throw if secret is too short', () => {
      expect(() =>
        validateTypeAndContent('secret', '123'),
      ).toThrow(InvalidItemTypeError)
    })

    it('should not throw for valid secret', () => {
      expect(() =>
        validateTypeAndContent('secret', 'supersecret123'),
      ).not.toThrow()
    })
  })

  describe('text type', () => {
    it('should allow empty content', () => {
      expect(() =>
        validateTypeAndContent('text', undefined),
      ).not.toThrow()
    })

    it('should not throw for valid text', () => {
      expect(() =>
        validateTypeAndContent('text', 'hello'),
      ).not.toThrow()
    })
  })
})
