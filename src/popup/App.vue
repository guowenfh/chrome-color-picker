<template>
  <ColorPicker />
</template>

<script>
import ColorPicker from './ColorPicker'
export default {
  name: 'App',
  components: { ColorPicker }
}
</script>

<style>
html {
  width: 225px;
  height: 315px;
}
html body {
  margin: 0;
}
</style>
