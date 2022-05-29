import Vue from 'vue'
import '@/assets/icons'
import { Select, Option, Popover, Input, Button, TableColumn, Tooltip, Table, Dialog, Collapse, CollapseItem, Switch } from 'element-ui'
import App from './App.vue'
import router from './router'

Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Select)
Vue.use(Popover)
Vue.use(Tooltip)
Vue.use(Input)
Vue.use(Button)
Vue.use(Option)
Vue.use(Dialog)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Switch)

Vue.config.productionTip = false

window.onerror = (message) => {
  if ((message).toString().includes('Uncaught SyntaxError: Unexpected token')) {
    location.reload()
  }
}

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
