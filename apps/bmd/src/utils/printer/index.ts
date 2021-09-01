import { Printer } from '../../config/types'
import LocalPrinter from './LocalPrinter'
import NullPrinter from './NullPrinter'

export { LocalPrinter, NullPrinter }

export default function getPrinter(): Printer {
  return window.kiosk ?? new LocalPrinter()
}
