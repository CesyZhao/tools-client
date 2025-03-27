import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    nav: {
      theme: '主题',
      language: '语言'
    },
    menu: {
      addText: '文本替换',
      imageRecognition: '图片识别',
      extractText: '提取文字',
      removeBackground: '智能抠图',
      imageCompletion: '背景替换',
      imageGeneration: '图片生成'
    },
    'work-zone': {
      title: '选择图片或者文件夹以消除背景',
      tip1: '拖入图片、文件夹',
      tip2: '或者粘贴图片',
      button: '上传图片',
      modelLoading: '模型加载中...'
    },
    settings: {
      paths: {
        title: '路径设置',
        modelPath: {
          title: '模型下载路径',
          description: '设置AI模型的下载和存储位置'
        },
        savePath: {
          title: '文件保存路径',
          description: '设置处理后的文件默认保存位置'
        }
      }
    }
  },
  en: {
    nav: {
      theme: 'Theme',
      language: 'Language'
    },
    menu: {
      addText: 'Add Text',
      imageRecognition: 'Image Recognition',
      extractText: 'Extract Text',
      removeBackground: 'Remove Background',
      imageCompletion: 'Replace Background',
      imageGeneration: 'Image Generation'
    },
    'work-zone': {
      title: 'Select an image or folder to remove the background',
      tip1: 'Drag an image or folder',
      tip2: 'Or paste an image',
      button: 'Upload Image',
      modelLoading: 'Model loading...'
    },
    settings: {
      paths: {
        title: 'Path Settings',
        modelPath: {
          title: 'Model Download Path',
          description: 'Set the download and storage location for AI models'
        },
        savePath: {
          title: 'File Save Path',
          description: 'Set the default save location for processed files'
        }
      }
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages
})
