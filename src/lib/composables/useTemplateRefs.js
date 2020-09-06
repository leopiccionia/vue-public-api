import { customRef, getCurrentInstance } from 'vue'

const proxyCache = new WeakMap()

function normalizeApi (api) {
  if (api instanceof Map) {
    return api
  } else if (Array.isArray(api)) {
    return new Map(api.map(key => [key, key]))
  } else {
    return new Map(Object.entries(api))
  }
}

function getRefProxy (templateRef, publicApi) {
  const cachedRef = proxyCache.get(templateRef)
  if (cachedRef) {
    return cachedRef
  }

  const apiMap = normalizeApi(publicApi)

  const refHandler = {
    get (target, key, receiver) {
      return apiMap.has(key)
        ? Reflect.get(target, apiMap.get(key), receiver)
        : undefined
    },
    has (target, key) {
      return apiMap.has(key)
    },
    ownKeys () {
      return apiMap.keys()
    }
  }

  const proxiedRef = new Proxy(templateRef, refHandler)
  proxyCache.set(templateRef, proxiedRef)
  return proxiedRef
}

function getTemplateRef (instance, key) {
  return customRef(() => ({
    get () {
      const templateRef = Reflect.get(instance.refs, key)
      const publicApi = templateRef?.$options?.expose ?? templateRef?.expose
      if (publicApi) {
        return getRefProxy(templateRef, publicApi)
      } else {
        return templateRef
      }
    }
  }))
}

export function useTemplateRefs () {
  const instance = getCurrentInstance()

  return new Proxy({}, {
    get (target, key) {
      return getTemplateRef(instance, key)
    },
    has (target, key) {
      return Reflect.has(instance.refs, key)
    },
    ownKeys () {
      return Reflect.ownKeys(instance.refs)
    },
  })
}
