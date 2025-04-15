import { BridgeEvent } from '../../../common/definitions/bridge'
import BaseModule from './Base'

class Log extends BaseModule {
  /**
   * 记录调试级别日志
   */
  debug(message: string, data?: unknown): Promise<void> {
    return this.invoke(BridgeEvent.LOG_DEBUG, message, data)
  }

  /**
   * 记录信息级别日志
   */
  info(message: string, data?: unknown): Promise<void> {
    return this.invoke(BridgeEvent.LOG_INFO, message, data)
  }

  /**
   * 记录警告级别日志
   */
  warn(message: string, data?: unknown): Promise<void> {
    return this.invoke(BridgeEvent.LOG_WARN, message, data)
  }

  /**
   * 记录错误级别日志
   */
  error(message: string, data?: unknown): Promise<void> {
    return this.invoke(BridgeEvent.LOG_ERROR, message, data)
  }
}

export default Log
