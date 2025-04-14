/**
 * 检查当前环境是否支持 WebGPU
 */
export const checkWebGPUSupport = async (): Promise<boolean> => {
  if (!navigator.gpu) {
    return false
  }

  try {
    const adapter = await navigator.gpu.requestAdapter()
    return !!adapter
  } catch (error) {
    console.error('WebGPU 检测失败:', error)
    return false
  }
}
