<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ipcRenderer } from 'electron';
import Core from './core/Core.vue';

@Component({
  components: {
    Core,
  },
})
class App extends Vue {
  private ipcRenderer = ipcRenderer
}

export default App;
</script>

<template>
  <div id="app">
    <v-app>
      <v-card height="100%">
        <v-app-bar
          fixed
          class="top"
          color="red"
          height="35"
          flat
        >
          <v-icon>mdi-fruit-grapes</v-icon>
          <span class="pl-3">My app</span>
          <div class="flex-grow-1"></div>
          <v-icon small class="icon pr-1" @click="ipcRenderer.send('minimize')">mdi-window-minimize</v-icon>
          <v-icon small class="icon pr-1" @click="ipcRenderer.send('maximize')">mdi-window-maximize</v-icon>
          <v-icon small class="icon" @click="ipcRenderer.send('close')">mdi-window-close</v-icon>
        </v-app-bar>
        <Core class = "core"></Core>
      </v-card>
    </v-app>
  </div>
</template>

<style>
  html {
    opacity: 0.97;
    overflow-y: hidden!important;
    border-radius: 14px!important;
  }
  .core {
    margin-top: 35px;
  }
  .top {
    -webkit-app-region: drag;
  }
  .icon {
    -webkit-app-region: no-drag;
  }
</style>
