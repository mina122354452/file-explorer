<template>
  <div class="flex justify-start mt-1 ml-0.5 mb-3">
    <input
      type="text"
      v-model="value"
      @input="this.$emit('type', value)"
      placeholder="Search"
      class="w-2/3 px-3 py-4 border rounded-full h-8 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:w-4/5 transition-all duration-300"
      :disabled="disabled"
    />
  </div>
</template>

<script>
export default {
  props: ['disabled'],
  data() {
    return {
      value: null
    }
  }
}
</script>
