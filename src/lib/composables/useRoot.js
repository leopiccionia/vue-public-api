import { getCurrentInstance } from 'vue'

import { getTemplateRef } from '../shared'

export function useRoot () {
  const instance = getCurrentInstance()

  return getTemplateRef(instance, instance => instance.root)
}