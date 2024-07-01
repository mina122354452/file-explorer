<!-- 

<template>
  <li>
    <span
      class="font-mono"
      :class="{
        'text-green-500': file.type === 'directory',
        'text-blue-500': file.type === 'file'
      }"
    >
      <div class="inline mr-3">
        <component
          :is="iconComponent"
          class="inline -ml-1"
          :fileExtension="file.extension.slice(1)"
        />
      </div>
      <span class="ml-2">{{ file.name }}</span>
      <span
        v-if="file.type === 'file' && file.extension !== 'unknown'"
        class="text-gray-600 text-sm ml-1 uppercase font-sans font-semibold"
      >
        ({{ file.extension.slice(1) + ' FILE' }})
      </span>
      <span
        v-if="file.type === 'file' && file.extension === 'unknown'"
        class="text-gray-600 text-sm ml-1 uppercase font-sans font-semibold"
      >
        ({{ file.extension + ' FILE' }})
      </span>
    </span>
  </li>
</template>

<script>
export default {
  props: ['file'],
  data() {
    return {
      iconComponent: null
    }
  },
  async created() {
    this.iconComponent = await this.loadIconComponent()
  },
  methods: {
    async loadIconComponent() {
      const icons = {
        directory: () => import('../composables/directoryIcon.vue'),
        unknown: () => import('../composables/unknownIcon.vue'),
        '.pdf': () => import('../composables/pdfIcon.vue'),
        '.aac': () => import('../composables/aacIcon.vue'),
        '.ai': () => import('../composables/aiIcon.vue'),
        '.avi': () => import('../composables/aviIcon.vue'),
        '.bmp': () => import('../composables/bmpIcon.vue'),
        '.cdr': () => import('../composables/cdrIcon.vue'),
        '.css': () => import('../composables/cssicon.vue'),
        '.csv': () => import('../composables/csvIcon.vue'),
        '.dll': () => import('../composables/dllIcon.vue'),
        '.doc': () => import('../composables/docIcon.vue'),
        '.docx': () => import('../composables/docIcon.vue'),
        '.dwg': () => import('../composables/dwgIcon.vue'),
        '.eps': () => import('../composables/epsIcon.vue'),
        '.exe': () => import('../composables/exeIcon.vue'),
        '.flv': () => import('../composables/flvIcon.vue'),
        '.gif': () => import('../composables/gifIcon.vue'),
        '.html': () => import('../composables/htmlIcon.vue'),
        '.iso': () => import('../composables/isoIcon.vue'),
        '.jar': () => import('../composables/jarIcon.vue'),
        '.jpg': () => import('../composables/jpgIcon.vue'),
        '.js': () => import('../composables/jsIcon.vue'),
        '.json': () => import('../composables/jsonIcon.vue'),
        '.mov': () => import('../composables/movIcon.vue'),
        '.mp3': () => import('../composables/mp3Icon.vue'),
        '.mp4': () => import('../composables/mp4Icon.vue'),
        '.php': () => import('../composables/phpIcon.vue'),
        '.ptt': () => import('../composables/pttIcon.vue'),
        '.psd': () => import('../composables/psdIcon.vue'),
        '.sql': () => import('../composables/sqlIcon.vue'),
        '.svg': () => import('../composables/svgIcon.vue'),
        '.ttf': () => import('../composables/ttfIcon.vue'),
        '.txt': () => import('../composables/txtIcon.vue'),
        '.wmv': () => import('../composables/wmvIcon.vue'),
        '.xls': () => import('../composables/xlsIcon.vue'),
        '.xml': () => import('../composables/xmlIcon.vue'),
        '.zip': () => import('../composables/zipIcon.vue')
      }

      try {
        if (this.file.type === 'directory') {
          const component = await icons['directory']()
          return component.default
        }

        if (this.file.type === 'file' && this.file.extension === 'unknown') {
          const component = await icons['unknown']()
          return component.default
        }

        const component = icons[this.file.extension]
        if (component) {
          const loadedComponent = await component()
          console.log(`Loaded component for ${this.file.extension}:`, loadedComponent)
          return loadedComponent.default
        } else {
          const fallbackComponent = await import('../composables/anotherIcon.vue')
          return fallbackComponent.default
        }
      } catch (error) {
        console.error(`Error loading component for ${this.file.extension}:`, error)
        const fallbackComponent = await import('../composables/anotherIcon.vue')
        console.log('Loaded fallback component due to error:', fallbackComponent)
        return fallbackComponent.default
      }
    }
  }
}
</script> -->
<template>
  <li>
    <span
      class="font-mono"
      :class="{
        'text-green-500': file.type === 'directory',
        'text-blue-500': file.type === 'file'
      }"
      ><div class="inline mr-3">
        <directoryIcon v-if="file.type === 'directory'" />
        <unknownIcon v-else-if="file.type === 'file' && file.extension === 'unknown'" />
        <pdfIcon
          v-else-if="file.type === 'file' && file.extension === '.pdf'"
          class="inline -ml-1"
        />
        <aacIcon
          v-else-if="file.type === 'file' && file.extension === '.aac'"
          class="inline -ml-1"
        />
        <aiIcon v-else-if="file.type === 'file' && file.extension === '.ai'" class="inline -ml-1" />
        <aviIcon
          v-else-if="file.type === 'file' && file.extension === '.avi'"
          class="inline -ml-1"
        />
        <bmpIcon
          v-else-if="file.type === 'file' && file.extension === '.bmp'"
          class="inline -ml-1"
        />
        <cdrIcon
          v-else-if="file.type === 'file' && file.extension === '.cdr'"
          class="inline -ml-1"
        />
        <cssIcon
          v-else-if="file.type === 'file' && file.extension === '.css'"
          class="inline -ml-1"
        />
        <csvIcon
          v-else-if="file.type === 'file' && file.extension === '.csv'"
          class="inline -ml-1"
        />
        <dllIcon
          v-else-if="file.type === 'file' && file.extension === '.dll'"
          class="inline -ml-1"
        />
        <docIcon
          v-else-if="
            file.type === 'file' && (file.extension === '.doc' || file.extension === '.docx')
          "
          class="inline -ml-1"
        />
        <dwgIcon
          v-else-if="file.type === 'file' && file.extension === '.dwg'"
          class="inline -ml-1"
        />
        <epsIcon
          v-else-if="file.type === 'file' && file.extension === '.eps'"
          class="inline -ml-1"
        />
        <exeIcon
          v-else-if="file.type === 'file' && file.extension == '.exe'"
          class="inline -ml-1"
        />
        <flvIcon
          v-else-if="file.type === 'file' && file.extension == '.flv'"
          class="inline -ml-1"
        />
        <gifIcon
          v-else-if="file.type === 'file' && file.extension == '.gif'"
          class="inline -ml-1"
        />
        <htmlIcon
          v-else-if="file.type === 'file' && file.extension == '.html'"
          class="inline -ml-1"
        />
        <isoIcon
          v-else-if="file.type === 'file' && file.extension === '.iso'"
          class="inline -ml-1"
        />
        <jarIcon
          v-else-if="file.type === 'file' && file.extension == '.jar'"
          class="inline -ml-1"
        />
        <jpgIcon
          v-else-if="file.type === 'file' && file.extension == '.jpg'"
          class="inline -ml-1"
        />
        <jsIcon v-else-if="file.type === 'file' && file.extension == '.js'" class="inline -ml-1" />
        <jsonIcon
          v-else-if="file.type === 'file' && file.extension == '.json'"
          class="inline -ml-1"
        />
        <movIcon
          v-else-if="file.type === 'file' && file.extension == '.mov'"
          class="inline -ml-1"
        />
        <mp3Icon
          v-else-if="file.type === 'file' && file.extension == '.mp3'"
          class="inline -ml-1"
        />
        <mp4Icon
          v-else-if="file.type === 'file' && file.extension == '.mp4'"
          class="inline -ml-1"
        />
        <phpIcon
          v-else-if="file.type === 'file' && file.extension == '.php'"
          class="inline -ml-1"
        />
        <pttIcon
          v-else-if="file.type === 'file' && file.extension == '.ptt'"
          class="inline -ml-1"
        />
        <psdIcon
          v-else-if="file.type === 'file' && file.extension == '.psd'"
          class="inline -ml-1"
        />
        <sqlIcon
          v-else-if="file.type === 'file' && file.extension == '.sql'"
          class="inline -ml-1"
        />
        <svgIcon
          v-else-if="file.type === 'file' && file.extension == '.svg'"
          class="inline -ml-1"
        />
        <ttfIcon
          v-else-if="file.type === 'file' && file.extension == '.ttf'"
          class="inline -ml-1"
        />
        <txtIcon
          v-else-if="file.type === 'file' && file.extension == '.txt'"
          class="inline -ml-1"
        />
        <wmvIcon
          v-else-if="file.type === 'file' && file.extension == '.wmv'"
          class="inline -ml-1"
        />
        <xlsIcon
          v-else-if="file.type === 'file' && file.extension == '.xls'"
          class="inline -ml-1"
        />
        <xmlIcon
          v-else-if="file.type === 'file' && file.extension == '.xml'"
          class="inline -ml-1"
        />
        <zipIcon
          v-else-if="file.type === 'file' && file.extension == '.zip'"
          class="inline -ml-1"
        />
        <anotherIcon v-else :fileExtension="file.extension.slice(1)" />
      </div>
      <span class="ml-2">{{ file.name }}</span>
      <span
        v-if="file.type === 'file' && file.extension !== 'unknown'"
        class="text-gray-600 text-sm ml-1 uppercase font-sans font-semibold"
        >({{ file.extension.slice(1) + ' FILE' }})</span
      >
      <span
        v-if="file.type === 'file' && file.extension == 'unknown'"
        class="text-gray-600 text-sm ml-1 uppercase font-sans font-semibold"
        >({{ file.extension + ' FILE' }})</span
      >
    </span>
  </li>
</template>
<script>
import directoryIcon from '../composables/directoryIcon.vue'
import unknownIcon from '../composables/unknownIcon.vue'
import pdfIcon from '../composables/pdfIcon.vue'
import aacIcon from '../composables/aacIcon.vue'
import aiIcon from '../composables/aiIcon.vue'
import aviIcon from '../composables/aviIcon.vue'
import bmpIcon from '../composables/bmpIcon.vue'
import cdrIcon from '../composables/cdrIcon.vue'
import cssIcon from '../composables/cssicon.vue'
import csvIcon from '../composables/csvIcon.vue'
import dllIcon from '../composables/dllIcon.vue'
import docIcon from '../composables/docIcon.vue'
import dwgIcon from '../composables/dwgIcon.vue'
import epsIcon from '../composables/epsIcon.vue'
import exeIcon from '../composables/exeIcon.vue'
import flvIcon from '../composables/flvIcon.vue'
import gifIcon from '../composables/gifIcon.vue'
import htmlIcon from '../composables/htmlIcon.vue'
import isoIcon from '../composables/isoIcon.vue'
import jarIcon from '../composables/jarIcon.vue'
import jpgIcon from '../composables/jpgIcon.vue'
import jsIcon from '../composables/jsIcon.vue'
import jsonIcon from '../composables/jsonIcon.vue'
import movIcon from '../composables/movIcon.vue'
import mp3Icon from '../composables/mp3Icon.vue'
import mp4Icon from '../composables/mp4Icon.vue'
import phpIcon from '../composables/phpIcon.vue'
import pttIcon from '../composables/pttIcon.vue'
import psdIcon from '../composables/psdIcon.vue'
import sqlIcon from '../composables/sqlIcon.vue'
import svgIcon from '../composables/svgIcon.vue'
import ttfIcon from '../composables/ttfIcon.vue'
import txtIcon from '../composables/txtIcon.vue'
import wmvIcon from '../composables/wmvIcon.vue'
import xlsIcon from '../composables/xlsIcon.vue'
import xmlIcon from '../composables/xmlIcon.vue'
import zipIcon from '../composables/zipIcon.vue'
import anotherIcon from '../composables/anotherIcon.vue'

export default {
  components: {
    directoryIcon,
    unknownIcon,
    pdfIcon,
    aacIcon,
    aiIcon,
    aviIcon,
    bmpIcon,
    cdrIcon,
    cssIcon,
    csvIcon,
    dllIcon,
    docIcon,
    dwgIcon,
    epsIcon,
    exeIcon,
    flvIcon,
    gifIcon,
    htmlIcon,
    isoIcon,
    jarIcon,
    jpgIcon,
    jsIcon,
    jsonIcon,
    movIcon,
    mp3Icon,
    mp4Icon,
    phpIcon,
    pttIcon,
    psdIcon,
    sqlIcon,
    svgIcon,
    ttfIcon,
    txtIcon,
    wmvIcon,
    xlsIcon,
    xmlIcon,
    zipIcon,
    anotherIcon
  },
  props: ['file']
}
</script>
