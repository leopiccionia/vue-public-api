import { getCurrentInstance } from 'vue'

import { getTemplateRef } from '../shared'

export function useParent () {
  const instance = getCurrentInstance()

  return getTemplateRef(instance, instance => instance.parent)
}