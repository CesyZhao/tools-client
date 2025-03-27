import { MenuKey, MenuModelMap } from '../../common/definitions/menu'

const modelConfig = {
  functionKey: MenuKey.RemoveBackground,
  modelName: MenuModelMap.get(MenuKey.RemoveBackground),
  files: ['onnx/model_quantized.onnx', 'preprocessor_config.json']
}

export default modelConfig
