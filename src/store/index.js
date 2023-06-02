import Vue from 'vue'
import Vuex from 'vuex'
import cart from './modules/cart'
import products from './modules/products'
import taos from './modules/taos'
import taos_tree from './modules/taos_tree'
import taos_connections from './modules/connections/taos_connections'
import {createLogger} from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    cart,
    products,
    taos,
    taos_tree,
    taos_connections
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
