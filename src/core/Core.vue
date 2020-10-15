<script lang="ts">
import io from 'socket.io-client';
import {ipcRenderer} from 'electron';
import {Component, Vue} from 'vue-property-decorator';

interface Message {
  sender: string,
  type: string,
  body: string,
  createdAt: string
}

@Component
class App extends Vue {
  private socket = io ('https://serverfff.herokuapp.com/messages');
  private messages: Array<Message> = [];
  private ipcRenderer = ipcRenderer;
  private message: string = '';
  private name: string = '';
  private color: string = '';
  private dialog: boolean = true;
  private valid: boolean = false;
  private savedFile: object = {};
  private file: string = '';
  private colors: Array<string> = [
    '#880E4F',
    '#4A148C',
    '#512DA8',
    '#0D47A1',
    '#00695C',
    '#01579B',
    '#1B5E20',
    '#D84315',
    '#E65100'
  ];

  mounted () {
    this.addSocketListener ();
  }

  private addSocketListener () {
    this.socket.on ('updated', (data: Array<Message>) => {
      if (Array.isArray (data)) {
        this.messages.push (...data);
      } else {
        this.messages.push (data);
      }
      this.scrollToBottom ();
    });
  }

  private getFileSize (size: number): string {
    if (size < 1024) {
      return size.toString().substr(0, 4) + ' B';
    }
    return (size / 1024).toString().substr(0, 6) + ' KB';
  }

  private getUserColor () {
    const min = 0;
    const max = this.colors.length;
    return this.colors[Math.floor (Math.random () * (max - min)) + min];
  }

  private scrollToBottom () {
    this.$nextTick (() => {
      const container = this.$el.querySelector ('#container');
      // @ts-ignore
      container.scrollTop = container.scrollHeight;
      console.log(container)
    });
  }

  private exit () {
    this.ipcRenderer.send ('close');
  }

  private login () {
    // @ts-ignore
    if (this.$refs.form.validate ()) {
      this.color = this.getUserColor ();
      this.dialog = false;
      this.scrollToBottom ();
    }
  }

  private sendMessage () {
   if (this.message) {
     this.socket.emit ('set', {
       sender: this.name,
       type: 'text',
       body: this.message,
       avatar: this.color
     });
     this.message = '';
   }
  }

  private handleFilePicked () {
    // @ts-ignore
    const file = event.target.files[0];
    const fileReader = new FileReader ();

    fileReader.readAsDataURL (file);
    fileReader.addEventListener ('load', () => {
      this.socket.emit ('set', {
        sender: this.name,
        type: 'file',
        body: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileReader.result
        },
        avatar: this.color
      });
    });
  }

  private pickFile () {
    // @ts-ignore
    this.$refs.file.click ();
  }

  private download (file: object) {
    // @ts-ignore
    this.$refs.link.click ();
    this.savedFile = file;
  }
}

export default App;
</script>

<template>
  <div v-bar>
    <div id="container" class="message-area">
      <div
        v-show="!dialog"
        class="card-message"
        v-for="item in messages"
      >
        <v-avatar
          class="avatar ml-3"
          :color="item.avatar"
          size="48"
        >
          {{item.sender[0].toUpperCase()}}
        </v-avatar>
        <v-card
          :color="item.color"
          class="message ml-6 mr-3"
        >
          <div v-if="item.type === 'file'">
            <v-img
              style="width: 100vh"
              v-if="item.body.type.includes('image')"
              :src="item.body.data"
              @click="download(item.body)"
            ></v-img>
            <div
              class="file pa-3"
              v-else
            >
              <v-icon
                @click="download(item.body)"
                large
                class="file-icon"
              >
                mdi-file
              </v-icon>
              <div>{{item.body.name}}</div>
              <div class="font-style font-weight-light">{{getFileSize(item.body.size)}}</div>
            </div>
          </div>
          <v-card-text style="color: white" v-else-if ="item.type === 'info'">
            <pre>
              {{item.body}}
            </pre>
          </v-card-text>
          <v-card-text style="color: white" v-else>
            {{item.body}}
          </v-card-text>
        </v-card>
      </div>
    </div>
    <v-textarea
      rows="1"
      row-height="30"
      class="textarea pl-2 pr-3"
      auto-grow
      placeholder="Send message..."
      v-model="message"
      @keypress.enter.prevent="sendMessage()"
    >
      <template v-slot:append-outer>
        <v-icon v-if="message" @click="sendMessage()">mdi-send</v-icon>
        <v-icon v-else>mdi-microphone</v-icon>
      </template>
      <template v-slot:prepend>
        <v-icon @click="pickFile()">mdi-paperclip</v-icon>
      </template>
    </v-textarea>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          Login
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            onSubmit="return false;"
          >
            <v-text-field
              @keyup.enter="login()"
              :rules="[v => !!v || 'Field is required']"
              v-model="name"
              placeholder="Enter your name"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="blue darken-1" text @click="exit()">Exit</v-btn>
          <v-btn color="blue darken-1" text @click="login()">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <input
      v-show="false"
      @change="handleFilePicked()"
      ref="file"
      class="display-input"
      type="file"
    >
    <a
      v-show="false"
      ref="link"
      :href="savedFile.data"
      :download="savedFile.name"
    ></a>
  </div>
</template>

<style scoped>
  .textarea {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .font-style {
    font-size: 14px;
    color: hsla(0, 0%, 100%, .7)
  }

  .message-area {
    position: fixed;
    width: 100%;
    height: calc(100vh - 100px);
    overflow-y: auto;
    bottom: 75px;
  }

  .file {
    display: grid;
    grid-template-columns: 45px 1fr;
  }

  .file-icon {
    grid-row-start: 1;
    justify-self: start;
    grid-row-end: 3;
  }

  .card-message {
    display: grid;
    width: fit-content;
    margin-bottom: 16px;
    grid-template-columns: 50px 1fr;
  }

  .avatar {
    align-self: end;
  }

</style>

