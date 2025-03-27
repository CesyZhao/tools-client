abstract class Base {
  protected namespace: string

  constructor(namespace: string) {
    this.namespace = namespace
  }

  protected async invoke<T>(event: string, ...args: unknown[]): Promise<T> {
    return window.api.invoke(event, ...args)
  }
}

export default Base
