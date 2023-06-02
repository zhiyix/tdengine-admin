import taos_api from '../../../api/taos'
import mitt from 'mitt'

// initial state
const state = () => ({
  theLink: {}, // L97 当前连接
  theDB:   "", // L98 当前数据库
  emitter: mitt()
})

// getters
const getters = {}

// actions
const actions = {
  //--------------------------------------------------------------------------------------------
  async init ({ commit }) {
    const res = await taos_api.getLinksAndVersion()
    /** 
     * #Array
     * host: "tdengine"
     * name: "localhost"
     * password: "taosdata"
     * port: "6041"
     * user: "root"
     * version: "3.0.4.2"
     */
    return res
  },
  //--------------------------------------------------------------------------------------------
  // SHOW DATABASES
  async connect ({ commit, state }, connect_info) {
    const res = await taos_api.connect(connect_info)
    if (res.status) {
      const res2 = await taos_api.select_version(connect_info)
      taos_api.updateLinks({
        name: connect_info.name, 
        host: connect_info.host, 
        port: connect_info.port, 
        user: connect_info.user, 
        password: connect_info.password,
        version: res2.version
      })
      return { 'status': true, 'data': taos_api.getLinks() }
    } else {
      return res 
    }
  },
  //------------------------------------------------------------------------------------------------------
  // SHOW DATABASES
  select_databases({ commit, state }, connect_info) {
    return taos_api.show_databases(connect_info).then(res => {
      if (!res.status) {
        commit('setErrorResponse', res)
      }
      /**
       * #Array
       * name: "information_schema"
       * name: "performance_schema"
       */
      return res
    })
  },
  change_connection_and_db({ commit }, link_db) {
    commit('setCurrLink', link_db[0])
    commit('setCurrDB', link_db[1])
  },
}

// mutations
const mutations = {
  // Current link
  setCurrLink (state, link) {
    state.theLink = link
  },
  // 当前数据库
  setCurrDB (state, db_name) {
    state.theDB = db_name
  },
  // -------------------------------------------------------------------------------------------------------
  setErrorResponse (state, status) {
    state.emitter.emit('setErrorResponse', status)
  }
}


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
