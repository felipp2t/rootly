import { lookup as lookupFile } from 'mime-types'

export function lookup(name: string): string | false {
  return lookupFile(name)
}
