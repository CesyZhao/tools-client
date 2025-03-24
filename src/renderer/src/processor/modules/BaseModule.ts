abstract class BaseModule {
  abstract name: string

  abstract load: () => void
  abstract destroy: () => void

  abstract getProcessor<T>(): T
  abstract getModel<T>(): T

  abstract process<T, V>(input: T): V
}

export default BaseModule
