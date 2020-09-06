<template>
  <Child ref="child"/>
  <button @click="childRef.print('Button clicked')">Click</button>
</template>

<script>
import { onMounted } from 'vue'
import { useTemplateRefs } from '../lib'
import Child from './Child.vue'

export default {
  name: 'Parent',
  components: {
    Child,
  },
  setup () {
    const { child } = useTemplateRefs()

    onMounted(() => {
      child.value.focus()
      child.value.print('Hello from parent')
    })

    return { childRef: child }
  },
}
</script>