# Vue Public API (POC)

This is a proof-of-concept for exposing a public API for your components, i.e. avoiding consumers to accidentally depend on internal state and methods.

It's implemented 100% in userland, and it's intended as a replacement/complement for built-in `vm.$refs` usage.

The exposed API will be a non-binding contract, that can be worked around (e.g. accessing `vm.$refs` directly). It's **NOT** designed as a security feature.

It's not widely tested, so there may be bugs and edge cases. It also depends on some internal details, so it can break eventually. Use it at your own risk.

## Why?

Sometimes, you need to expose some methods to the template, but don't intend them to be visible by other components. For further discussions on the need for such type of mechanism in Vue, see [here](https://github.com/vuejs/rfcs/pull/135) and [here](https://github.com/vuejs/rfcs/pull/210).

For a different, TypeScript-only, approach to the same problem, see my repo about [typing Vue with interfaces](https://github.com/leopiccionia/typing-vue-with-interfaces).

## API

The POC exports a `useTemplateRefs` function, that can be used inside Composition API.

The child component can contain an `expose` option, to specify the keys that'll be exposed in the public API. It can take three different shapes:

* An array of keys;
* An object, where the keys are the external names and values are the internal names;
* A Map, where the keys are the external names and values are the internal names.

For compatibility, if `expose` option is not present, all keys are considered to be public. To lock the component, instead, use `expose: []`.

```javascript
import { onMounted, ref } from 'vue'

const Child = {
  name: 'Child',
  setup () {
    const message = ref('Hi')
    const setMessage = (text) => message.value = text
    return { message, setMessage }
  },
  expose: ['setMessage'],
  template: '<p>{{ message }}</p>',
}

const Parent = {
  name: 'Parent',
  components: {
    Child,
  },
  setup () {
    onMounted (() => {
      const { child } = useTemplateRefs()
      onMounted(() => {
        // child.value.message is not accessible
        child.value.setMessage('Hello')
      })
    })
  },
  template: '<Child ref="child"/>'
}
```

## How does it work

It proxies the instance's raw template refs (i.e. `vm.$refs`) to guarantee that keys not present in `expose` array are not visible by the refs exposed by `useTemplateRefs`.

The proxied refs are lazily-generated, and cached for future calls.

If the `expose` option is not found before proxy creation (e.g. the ref is a HTML element, not a Vue component), the raw ref is returned instead of a proxy.

![Good luck, I'm behind 7 proxies](https://i.kym-cdn.com/photos/images/original/000/130/831/SPIDERMANLUCK.png)

## Known limitations

* Use of function refs

## TODO

* TypeScript support
* Testing
