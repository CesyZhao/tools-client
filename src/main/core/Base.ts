import { BrowserWindow, ipcMain } from 'electron'
import { BridgeEvent } from '../../common/definitions/bridge'

class Base {
  protected moduleName: string

  constructor(moduleName: string) {
    this.moduleName = moduleName
  }

  /**
   * 注册 IPC 处理器
   */
  protected registerHandlers(): void {
    // 子类实现
  }

  /**
   * 注册 IPC 处理方法
   * @param channel 通道名
   * @param handler 处理函数
   */
  protected handle(channel: string, handler: (...args) => unknown): void {
    ipcMain.handle(`${channel}`, async (event, ...args) => {
      try {
        return await handler(...args)
      } catch (error) {
        console.error(`处理 ${channel} 请求时出错:`, error)
        throw error
      }
    })
  }

  /**
   * 向渲染进程发送事件
   * @param event 事件名称
   * @param data 事件数据
   */
  protected sendEvent(event: BridgeEvent | string, data: unknown): void {
    const windows = BrowserWindow.getAllWindows()
    for (const window of windows) {
      if (!window.isDestroyed()) {
        window.webContents.send(event, data)
      }
    }
  }
}

export default Base
