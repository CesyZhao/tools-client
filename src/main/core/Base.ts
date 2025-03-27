import { ipcMain } from 'electron'

abstract class Base {
  protected namespace: string

  constructor(namespace: string) {
    this.namespace = namespace
    this.registerHandlers()
  }

  protected abstract registerHandlers(): void

  protected handle(event: string, handler: (...args: unknown[]) => unknown): void {
    ipcMain.handle(event, (_, ...args) => handler(...args))
  }
}

export default Base
