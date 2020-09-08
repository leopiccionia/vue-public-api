import { customRef, getCurrentInstance } from 'vue'

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
      return publicApi.has(key)
        ? Reflect.get(target, publicApi.get(key), receiver)
        : undefined
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

function getTemplateRef (instance, key) {
  return customRef(() => ({
    get () {
      const templateRef = Reflect.get(instance.refs, key)
      const allowlist = templateRef?.$options?.expose
      if (allowlist) {
        return getTemplateRefProxy(templateRef, allowlist)
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
