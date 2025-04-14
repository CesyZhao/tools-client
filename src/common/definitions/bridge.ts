export enum BridgeEvent {
  // 设置相关事件
  SETTING_GET = 'setting:get',
  SETTING_SET = 'setting:set',
  SETTING_GET_ALL = 'setting:getAll',
  SETTING_RESET = 'setting:reset',

  // 环境相关事件
  ENVIRONMENT_CHECK_MODELS = 'environment:checkModels',

  // 模型相关事件
  MODEL_DOWNLOAD = 'model:download',
  MODEL_CANCEL_DOWNLOAD = 'model:cancelDownload',
  MODEL_GET_DOWNLOAD_PROGRESS = 'model:getDownloadProgress',
  MODEL_DOWNLOAD_PROGRESS = 'model:downloadProgress',

  // 文件相关事件
  FILE_SELECT_FOLDER = 'file:selectFolder',
  FILE_SELECT_IMAGE = 'file:selectImage',
  FILE_SELECT_FOLDER_IMAGES = 'file:selectFolderImages'
}
