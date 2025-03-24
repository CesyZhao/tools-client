abstract class BaseModule {
  abstract name: string

  abstract load(): void
  abstract destroy(): void
}

export default BaseModule
