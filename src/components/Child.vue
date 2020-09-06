<template>
  <input ref="input">
</template>

<script>
import { useTemplateRefs } from '../lib'

export default {
  name: 'Child',
  expose: ['focus', 'print'],
  setup () {
    const { input } = useTemplateRefs()

    const blur = () => input.value.blur() // This method is not exposed via `useTemplateRefs`
    const focus = () => input.value.focus()

    const print = (text) => {
      console.group('Text passed by parent')
      console.log(text)
      console.groupEnd()
    }

    return { blur, focus, print }
  },
}
</script>