import { createI18n } from 'vue-i18n'

// 添加 entry 组件的国际化内容
const messages = {
  zh: {
    common: {
      download: '下载',
      downloading: '下载中',
      downloadStarted: '下载已开始',
      downloadFailed: '下载失败',
      downloadCompleted: '下载完成'
    },
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
      modelLoading: '模型加载中...',
      modelLoadFailed: '模型加载失败',
      retry: '重试'
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
      },
      performance: {
        title: '性能设置',
        enableGPU: {
          title: '启用 GPU 加速',
          description: '使用 GPU 加速模型推理，提高处理速度。如果遇到兼容性问题，可以关闭此选项。'
        }
      },
      // 添加设置组件的词条
      title: '设置',
      reset: '重置',
      select: '选择',
      confirm: '确定',
      messages: {
        pathUpdated: '路径已更新',
        pathSelectFailed: '选择路径失败',
        loadFailed: '加载设置失败',
        saved: '设置已保存',
        saveFailed: '保存设置失败',
        resetSuccess: '设置已重置为默认值',
        resetFailed: '重置设置失败'
      }
    },
    entry: {
      steps: {
        environment: {
          title: '基础环境',
          waiting: '等待检查',
          checking: '正在检查环境支持情况...',
          finished: '环境检查已完成',
          checkFailed: '检查失败'
        },
        dependencies: {
          title: '必要依赖',
          waiting: '等待检查',
          checking: '正在检查模型...',
          finished: '模型检查已完成',
          checkFailed: '模型检查失败'
        },
        config: {
          title: '系统配置',
          waiting: '等待完成',
          checking: '正在检查系统配置...',
          normal: '系统配置正常',
          checkFailed: '系统配置检查失败'
        }
      },
      modelStatus: {
        title: '模型状态',
        downloaded: '已下载',
        notDownloaded: '未下载'
      }
    }
  },
  en: {
    common: {
      download: 'download',
      downloading: 'Downloading',
      downloadStarted: 'Download started',
      downloadFailed: 'Download failed',
      downloadCompleted: 'Download completed'
    },
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
      modelLoading: 'Model loading...',
      modelLoadFailed: 'Model loading failed',
      retry: 'Retry'
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
      },
      performance: {
        title: 'Performance Settings',
        enableGPU: {
          title: 'Enable GPU Acceleration',
          description:
            'Use GPU acceleration for model inference, improving processing speed. If you encounter compatibility issues, you can turn off this option.'
        }
      },
      // 添加设置组件的英文词条
      title: 'Settings',
      reset: 'Reset',
      select: 'Select',
      confirm: 'Confirm',
      messages: {
        pathUpdated: 'Path updated',
        pathSelectFailed: 'Failed to select path',
        loadFailed: 'Failed to load settings',
        saved: 'Settings saved',
        saveFailed: 'Failed to save settings',
        resetSuccess: 'Settings reset to default',
        resetFailed: 'Failed to reset settings'
      }
    },
    entry: {
      steps: {
        environment: {
          title: 'Basic Environment',
          waiting: 'Waiting for check',
          checking: 'Checking WebGPU support...',
          supported: 'WebGPU supported',
          notSupported: 'WebGPU not supported',
          checkFailed: 'WebGPU check failed'
        },
        dependencies: {
          title: 'Required Dependencies',
          waiting: 'Waiting for check',
          checking: 'Checking models...',
          allDownloaded: 'All models downloaded',
          someNotDownloaded: 'Some models not downloaded',
          checkFailed: 'Model check failed'
        },
        config: {
          title: 'System Configuration',
          waiting: 'Waiting to complete',
          checking: 'Checking system configuration...',
          normal: 'System configuration normal',
          checkFailed: 'System configuration check failed'
        }
      },
      modelStatus: {
        title: 'Model Status',
        downloaded: 'Downloaded',
        notDownloaded: 'Not Downloaded'
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
