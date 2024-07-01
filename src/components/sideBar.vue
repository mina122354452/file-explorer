<!-- <template>
  <div
    @click.self="toggleShow"
    :class="{
      'w-44  bg-neutral-200 ': show,
      'w-14 flex-wrap bg-neutral-100 ': !show
    }"
    class="h-[100vh] flex z-50 rounded-sm hover:bg-neutral-200 transition-all flex-wrap"
  >
    <div
      @click.self="toggleShow"
      class="flex items-center relative line-under"
      :class="{ 'items-center': show }"
    >
      <menuIcon
        class="w-7 h-7 m-3 transition-all hover:scale-110"
        @click="toggleShow"
        :class="{ 'rotate-180': show }"
      />
      <p v-show="show" class="font-extrabold">menu list</p>
    </div>

    <div v-show="show" class="flex flex-wrap w-44 h-[88vh] content-start">
      <mainItem />
      <h2 class="font-serif px-2 py-2 text-sm">This Device Contains:</h2>
      <sideItem
        v-for="partition in partitions"
        :key="partition.DriveLetter"
        :partition="partition"
      />
    </div>
  </div>
</template>

<script>
import menuIcon from '../composables/menuIcon.vue'
import sideItem from '@/components/sideItem.vue'
import mainItem from '@/components/mainItem.vue'
export default {
  props: ['partitions'],
  components: {
    menuIcon,
    sideItem,
    mainItem
  },
  data() {
    return {
      show: false
    }
  },
  methods: {
    toggleShow() {
      this.show = !this.show
    },
    closeMenu(event) {
      if (!this.$el.contains(event.target)) {
        console.log(this.$el.contains(event.target))
        console.log(this.$el)

        this.show = false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.closeMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu)
  }
}
</script>
<style>
.line-under::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px; /* Adjust the thickness of the line */
  background-color: #ccc; /* Customize the color */
}
</style> -->
<template>
  <div
    @click.self="toggleShow"
    :class="{
      'w-48 bg-neutral-200': show,
      'w-14 flex-wrap bg-neutral-100': !show
    }"
    class="h-[100vh] flex z-50 rounded-sm hover:bg-neutral-200 transition-all flex-wrap"
  >
    <div
      @click.self="toggleShow"
      class="flex items-center relative"
      :class="{ 'items-center line-under': show }"
    >
      <menuIcon
        class="w-7 h-7 m-3 transition-all hover:scale-110 cursor-pointer"
        @click="toggleShow"
        :class="{ 'rotate-180': show }"
      />
      <transition name="fade-blur">
        <p v-show="show" class="font-extrabold">menu list</p>
      </transition>
    </div>

    <transition name="fade-blur">
      <div
        v-show="show"
        class="flex flex-wrap w-48 h-[88vh] content-start overflow-y-auto overflow-x-hidden"
      >
        <mainItem @click="toggleShow" />
        <taskItem @click="toggleShow" />
        <h2 class="font-serif px-2 py-2 text-sm">This Device Contains:</h2>
        <sideItem
          @click="toggleShow"
          v-for="partition in partitions"
          :key="partition.DriveLetter"
          :partition="partition"
        />
      </div>
    </transition>
  </div>
</template>
<script>
import menuIcon from '../composables/menuIcon.vue'
import sideItem from '@/components/sideItem.vue'
import mainItem from '@/components/mainItem.vue'
import taskItem from '@/components/taskItem.vue'

export default {
  props: ['partitions'],
  components: {
    menuIcon,
    sideItem,
    mainItem,
    taskItem
  },
  data() {
    return {
      show: false
    }
  },
  methods: {
    toggleShow() {
      this.show = !this.show
      this.$emit('open', this.show)
    },
    closeMenu(event) {
      if (!this.$el.contains(event.target)) {
        this.show = false
        this.$emit('open', this.show)
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.closeMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu)
  }
}
</script>
<style>
.line-under::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ccc;
}

.fade-blur-enter-active,
.fade-blur-leave-active {
  transition:
    opacity 0.1s ease,
    filter 0.1s ease; /* Adjusted duration */
}

.fade-blur-enter,
.fade-blur-leave-to {
  opacity: 0;
  filter: blur(5px);
}
</style>
