import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify/lib'
import 'element-ui/lib/theme-chalk/index.css'
import 'vuetify/src/stylus/app.styl'
import '@mdi/font/css/materialdesignicons.css'
import router from '@/router'
import Colors from '@/styles/Colors.css'
import Grid from '@/styles/Grid.css'
import Borders from '@/styles/Borders.css'
import Text from '@/styles/Text.css'
import General from '@/styles/General.css'
import VuetifyCSS from '@/styles/Vuetify.css'
import ElementCSS from '@/styles/Element.css'
import Auth from '@/services/Auth'
import Axios from 'axios'

document.addEventListener(
  'deviceready',
  async () => {
    window.handleOpenURL = url => {
      setTimeout(() => {
        window.location.href =
          window.location.href + url.replace('ufabcnext://', '');
      }, 0);
    };

    window.FirebasePlugin.onTokenRefresh(function(fcmToken) {
      localStorage.setItem('firebaseToken', fcmToken)
      Auth.addDevice()
    });
  },
  false
);

document.addEventListener("resume", () => {
  window.FirebasePlugin.getToken(function(fcmToken) {
    if (fcmToken) {
      localStorage.setItem('firebaseToken', fcmToken)
      Auth.addDevice()
    }
  });
}, false);

Vue.use(Vuetify)

import VCharts from 'v-charts'
Vue.use(VCharts)

import VueTheMask from 'vue-the-mask'
Vue.use(VueTheMask)

import VeeValidate, {Validator} from 'vee-validate'
Vue.use(VeeValidate);

import VueDialog from '@/helpers/VueDialog'
Vue.mixin(VueDialog)

import VeeLocale_pt_BR from 'vee-validate/dist/locale/pt_BR'
Validator.localize('pt_BR', VeeLocale_pt_BR)

import Element from 'element-ui'
Vue.use(Element)

Vue.config.productionTip = false

import {Model} from "vue-api-query";
Model.$http = Axios;

Axios.interceptors.response.use(null, function (error) {
  const status = error.response && error.response.status
  if (status === 401) {
    Auth.logOut()
  }

  return Promise.reject(error);
})

Axios.interceptors.request.use(function (config) {
  let isBase = config.baseURL == process.env.VUE_APP_API_URL
  if (isBase && config.url.startsWith('http')) {
    return config;
  }

  if (Auth.token) {
    config.headers['Authorization'] = 'Bearer ' + Auth.token
  }

  return config;
})

Axios.defaults.baseURL = process.env.VUE_APP_API_URL

window.Axios = Axios
window.Auth = Auth

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')