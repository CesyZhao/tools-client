import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import Base from '../core/Base'
import { BridgeEvent } from '../../common/definitions/bridge'

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * 日志配置接口
 */
interface LogConfig {
  level: LogLevel
  logToFile: boolean
  logDir?: string
  maxFileSize?: number // 单位：字节
  maxFiles?: number
}

/**
 * 日志消息接口
 */
export interface LogMessage {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
}

/**
 * 日志类，用于记录应用程序日志
 */
export class Log extends Base {
  private static instance: Log | null = null
  private config: LogConfig
  private logFile: string | null = null
  private logStream: fs.WriteStream | null = null

  /**
   * 私有构造函数，初始化日志配置
   */
  private constructor(config?: Partial<LogConfig>) {
    super('log')

    this.config = {
      level: LogLevel.INFO,
      logToFile: false,
      logDir: path.join(app.getPath('userData'), 'logs'),
      maxFileSize: 10 * 1024 * 1024, // 默认10MB
      maxFiles: 5,
      ...config
    }

    if (this.config.logToFile) {
      this.initLogFile()
    }

    this.registerHandlers()
  }

  /**
   * 获取日志实例（单例模式）
   */
  public static getInstance(config?: Partial<LogConfig>): Log {
    if (!Log.instance) {
      Log.instance = new Log(config)
    }
    return Log.instance
  }

  /**
   * 注册IPC处理程序
   */
  protected registerHandlers(): void {
    this.handle(BridgeEvent.LOG_DEBUG, (_event, message: string, data?: unknown) =>
      this.debug(message, data)
    )
    this.handle(BridgeEvent.LOG_INFO, (_event, message: string, data?: unknown) =>
      this.info(message, data)
    )
    this.handle(BridgeEvent.LOG_WARN, (_event, message: string, data?: unknown) =>
      this.warn(message, data)
    )
    this.handle(BridgeEvent.LOG_ERROR, (_event, message: string, data?: unknown) =>
      this.error(message, data)
    )
  }
  /**
   * 初始化日志文件
   */
  private initLogFile(): void {
    try {
      // 确保日志目录存在
      if (!fs.existsSync(this.config.logDir!)) {
        fs.mkdirSync(this.config.logDir!, { recursive: true })
      }

      // 创建日志文件名，使用日期作为文件名
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      this.logFile = path.join(this.config.logDir!, `${dateStr}.log`)

      // 创建写入流
      this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' })

      // 清理旧日志文件
      this.cleanOldLogs()
    } catch (error) {
      console.error('初始化日志文件失败:', error)
      this.config.logToFile = false
    }
  }

  /**
   * 关闭日志文件
   */
  private closeLogFile(): void {
    if (this.logStream) {
      this.logStream.end()
      this.logStream = null
    }
    this.logFile = null
  }

  /**
   * 清理旧日志文件
   */
  private cleanOldLogs(): void {
    try {
      const logDir = this.config.logDir!
      const files = fs
        .readdirSync(logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(logDir, file),
          time: fs.statSync(path.join(logDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time) // 按修改时间降序排序

      // 如果超过最大文件数，删除旧文件
      if (files.length > this.config.maxFiles!) {
        files.slice(this.config.maxFiles!).forEach(file => {
          fs.unlinkSync(file.path)
        })
      }
    } catch (error) {
      console.error('清理旧日志文件失败:', error)
    }
  }

  /**
   * 写入日志
   */
  private writeLog(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.config.level) return

    const now = new Date()
    const timeStr = now.toISOString()
    const levelStr = LogLevel[level].padEnd(5)

    // 创建日志消息对象
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: timeStr,
      data
    }

    // 格式化消息用于控制台和文件输出
    let formattedMessage = `[${timeStr}] [${levelStr}] ${message}`

    // 处理额外数据
    if (data !== undefined) {
      if (typeof data === 'object') {
        formattedMessage += ' ' + JSON.stringify(data)
      } else {
        formattedMessage += ' ' + data
      }
    }

    // 输出到控制台
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
    }

    // 写入日志文件
    if (this.config.logToFile && this.logStream) {
      this.logStream.write(formattedMessage + '\n')

      // 检查日志文件大小
      this.checkLogFileSize()
    }

    // 发送日志消息到渲染进程
    this.sendEvent(BridgeEvent.LOG_MESSAGE, logMessage)
  }

  /**
   * 检查日志文件大小，如果超过最大大小，创建新文件
   */
  private checkLogFileSize(): void {
    if (!this.logFile) return

    try {
      const stats = fs.statSync(this.logFile)
      if (stats.size >= this.config.maxFileSize!) {
        // 关闭当前日志文件
        this.closeLogFile()
        // 重新初始化日志文件
        this.initLogFile()
      }
    } catch (error) {
      console.error('检查日志文件大小失败:', error)
    }
  }

  /**
   * 记录调试级别日志
   */
  public debug(message: string, data?: unknown): void {
    this.writeLog(LogLevel.DEBUG, message, data)
  }

  /**
   * 记录信息级别日志
   */
  public info(message: string, data?: unknown): void {
    this.writeLog(LogLevel.INFO, message, data)
  }

  /**
   * 记录警告级别日志
   */
  public warn(message: string, data?: unknown): void {
    this.writeLog(LogLevel.WARN, message, data)
  }

  /**
   * 记录错误级别日志
   */
  public error(message: string, data?: unknown): void {
    this.writeLog(LogLevel.ERROR, message, data)
  }
}

// 导出默认实例
export default Log
