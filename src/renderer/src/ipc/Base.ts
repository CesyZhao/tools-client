const { ipcRenderer } = window.electron
class Base {
  protected moduleName: string

  constructor(moduleName: string) {
    this.moduleName = moduleName
  }

  protected async invoke<T>(channel: string, ...args): Promise<T> {
    try {
      return await ipcRenderer.invoke(channel, ...args)
    } catch (error) {
      console.error(`调用 ${this.moduleName}:${channel} 失败:`, error)
      throw error
    }
  }

  /**
   * 监听主进程发送的事件
   * @param channel 事件通道
   * @param callback 回调函数
   * @returns 取消监听的函数
   */
  protected on<T>(channel: string, callback: (data: T) => void): () => void {
    const handler = (_event: Electron.IpcRendererEvent, data: T): void => {
      callback(data)
    }

    ipcRenderer.on(channel, handler)

    // 返回取消监听的函数
    return () => {
      ipcRenderer.removeListener(channel, handler)
    }
  }

  /**
   * 监听主进程发送的一次性事件
   * @param channel 事件通道
   * @param callback 回调函数
   */
  protected once<T>(channel: string, callback: (data: T) => void): void {
    ipcRenderer.once(channel, (_event: Electron.IpcRendererEvent, data: T) => {
      callback(data)
    })
  }

  /**
   * 向主进程发送事件
   * @param channel 事件通道
   * @param data 事件数据
   */
  protected send(channel: string, ...args): void {
    ipcRenderer.send(`${this.moduleName}:${channel}`, ...args)
  }
}

export default Base
