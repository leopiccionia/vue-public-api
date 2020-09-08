import { customRef } from 'vue'

const proxyCache = new WeakMap()

function normalizeAllowlist (allowlist) {
  if (Array.isArray(allowlist)) {
    return new Map(allowlist.map(key => [key, key]))
  } else if (allowlist instanceof Map) {
    return allowlist
  } else {
    return new Map(Object.entries(allowlist))
  }
}

function getTemplateRefProxy (templateRef, allowlist) {
  const cachedRef = proxyCache.get(templateRef)
  if (cachedRef) {
    return cachedRef
  }

  const publicApi = normalizeAllowlist(allowlist)

  const handler = {
    get (target, key, receiver) {
      if (publicApi.has(key)) {
        return Reflect.get(target, publicApi.get(key), receiver)
      } else {
        return undefined
      }
    },
    has (target, key) {
      return publicApi.has(key)
    },
    ownKeys () {
      return publicApi.keys()
    }
  }

  const proxiedRef = new Proxy(templateRef, handler)
  proxyCache.set(templateRef, proxiedRef)
  return proxiedRef
}

export function getTemplateRef (instance, accessor) {
  return customRef(() => ({
    get () {
      const templateRef = accessor(instance)
      const allowlist = templateRef?.$options?.expose

      if (allowlist) {
        return getTemplateRefProxy(templateRef, allowlist)
      } else {
        return templateRef
      }
    }
  }))
}