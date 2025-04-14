import { ModelKey, ModelConfig } from '../../common/definitions/model'

const modelConfigList: ModelConfig[] = [
  {
    modelName: ModelKey.Briaai,
    files: ['onnx/model_quantized.onnx', 'preprocessor_config.json']
  },
  {
    modelName: ModelKey.Xenova,
    files: ['onnx/model_quantized.onnx', 'preprocessor_config.json']
  }
  // 可以添加更多模型配置
]

export default modelConfigList
