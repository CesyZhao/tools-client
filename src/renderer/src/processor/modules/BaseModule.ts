abstract class BaseModule<U, X> {
  abstract name: string

  abstract load: () => void
  abstract destroy: () => void

  abstract getProcessor<T>(): T
  abstract getModel<T>(): T

  abstract process(input: U): X
}

export default BaseModule
