import { PreTrainedModel, Processor } from '@huggingface/transformers'

abstract class BaseModule<U, X> {
  abstract readonly name: string
  protected model: PreTrainedModel | null = null
  protected processor: Processor | null = null
  protected static instance: unknown = null

  // 单例模式获取实例的静态方法
  static getInstance(): unknown {
    throw new Error('子类必须实现 getInstance 方法')
  }

  // 获取模型实例
  getModel<T>(): T {
    return this.model as T
  }

  // 获取处理器实例
  getProcessor<T>(): T {
    return this.processor as T
  }

  // 加载模型和处理器
  abstract load(): Promise<void>

  // 销毁模型和处理器
  destroy(): void {
    this.model = null
    this.processor = null
  }

  // 处理输入数据
  abstract process(input: U): X
}

export default BaseModule
