import { getCurrentInstance } from 'vue'

import { getTemplateRef } from '../shared'

export function useTemplateRefs () {
  const instance = getCurrentInstance()

  return new Proxy({}, {
    get (target, key) {
      return getTemplateRef(instance, instance => Reflect.get(instance.refs, key))
    },
    has (target, key) {
      return Reflect.has(instance.refs, key)
    },
    ownKeys () {
      return Reflect.ownKeys(instance.refs)
    },
  })
}