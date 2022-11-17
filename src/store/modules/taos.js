import taos_api from '../../api/taos'
import mitt from 'mitt'

// initial state
const state = () => ({
  dbInfo:               [], // L25
  superTableFilter: {       // L41
    fields:             [],
    superDateRange:     [],
    superTSearchText:   "",
    superTSearchColumn: "",
  },
  tableFilter: {            // L49
    fields:             [],
    dateRange:          [],
    tableSearchText:    "",
    tableSearchColumn:  "",
  },
  superTables:          [], // L61 超级表list
  superTableData:       [], // L62
  superTableName:       "", // L63
  totalSuperTable:       0, // L64
  superTableLabelItems: [], // L65
  superTableLabel:      [], // L66
  loadingSuperList:  false, // L67
  loadingSuperTable: false, // L68
  tables:               [], // L70 表list
  tableData:            [], // L71
  tableName:            "", // L72
  totalTable:            0, // L73
  tableLabelItems:      [], // L74
  tableLabel:           [], // L75
  loadingTableList:  false, // L76
  loadingTable:      false, // L77
  eachPageTable:   10, // L79
  currentPageTable: 1, // L80
  searchIcon:         true, // L94
  freshIcon:          true, // L94
  links:                [], // L96
  theLink:              {}, // L97 当前连接
  theDB:                "", // L98 当前数据库
  connect_info:         [],
  emitter: mitt()
})

// getters
const getters = {}

// actions
const actions = {
  init_links ({ commit }) {
    taos_api.getLinksAndVersion(links => {
      commit('setTaosLinks', links)
    })
  },
  // SHOW DATABASES
  connect ({ commit, state }, connect_info) {
    const savedLinks = [...state.links]
    commit('setConnectResponse', null)
    // empty cart
    commit('setTaosLinks', { items: [] })
    taos_api.connect(connect_info).then(res => {
      if (res.status) {
        taos_api.select_version(connect_info).then(res => {
          taos_api.updateLinks({
            name: connect_info.name, 
            host: connect_info.host, 
            port: connect_info.port, 
            user: connect_info.user, 
            password: connect_info.password,
            version: res.version
          })
          commit('setTaosLinks', taos_api.getLinks())
          commit('setConnectResponse', res)
        })
      } else {
        // error
        // rollback to the cart saved before sending the request
        commit('setTaosLinks', savedLinks)
        commit('setConnectResponse', res)
      }
    })
  },
  // L475
  clear_super_table({ commit }, clear_cache = true){
    if (clear_cache) {
      commit('setSuperTables', []) // clean
    }
    commit('setSuperTableName', "")
    commit('setTotalSuperTable', 0)
    commit('setSuperTableData', [])
    commit('setSuperTableLabel', [])
    commit('setSuperTableFilter', {
      fields:[],
      surperDateRange:[],
      surperTSearchText: "",
      surperTSearchColumn: "",
    })
  },
  // L487 clearTable
  clear_table({ commit }, clear_cache = true) {
    if (clear_cache) {
      commit('setTables', []) // clean
    }
    commit('setTableName', "")
    commit('setTotalTable', 0)
    commit('setTableData', [])
    commit('setTableLabel', [])
    commit('setTableFilter', {
      fields: [],
      dateRange: [],
      tableSearchText: "",
      tableSearchColumn: "",
    })
  },
  // SHOW DATABASES
  show_databases({ commit, state }, connect_info) {
    taos_api.show_databases(connect_info).then(res => {
      if (res.status) {
        state.links[connect_info.database_key].dbs = res.data
        commit('setTaosLinks', state.links)
        commit('setShowDatabaseResponse', res)
      } else {
        // rollback to the cart saved before sending the request
        commit('setTaosLinks', savedLinks)
        commit('setShowDatabaseResponse', res)
      }
    })
  },
  // L499
  // SHOW STABLES
  show_super_tables({ commit }, params) {
    //清理超级表列表
    commit('setSuperTables', [])
    //记录进入的数据库 
    commit('setCurrLink', params['connect_info'])
    commit('setCurrDB', params['db'])

    //清理选中的超级表和具体数据
    //.clear_super_table({ commit, state })
    commit('setLoadingSuperList', true)
    // showSuperTables
    taos_api.show_super_tables(params['connect_info'], params['db']).then(res => {
      if (res.status) {
        commit('setSuperTables', res.data)
        commit('setShowSuperTableResponse', res)
        commit('setLoadingSuperList', false)
      } else {
        commit('setShowSuperTableResponse', res)
        commit('setLoadingSuperList', false)
      }
    })
  },
  // L531 showTables
  // SELECT * FROM ${TABLE_NAME}
  show_tables({ commit, state }, params) {
    commit('setLoadingTableList', true)
    //清理表列表

    // showTables
    taos_api.show_tables(params['connect_info'], params['db']).then(res => {
      console.log(res)
      if (res.status) {
        commit('setTables', res.data)
        commit('setShowTableResponse', res)
        commit('setLoadingTableList', false)
      } else {
        commit('setShowTableResponse', res)
        commit('setLoadingTableList', false)
      }
    })
  },
  // L568
  // 查询数据
  // SELECT * FROM ${TABLE_NAME}
  select_super_table_data({ commit, state }, params) {
    commit('setLoadingSuperTable', true)
    // selectData
    taos_api.select_sql(
      params['connect_info'],
      state.theDB,
      state.superTableName,
      params,
    ).then(res =>{
      commit('setLoadingSuperTable', false)
      if (res.status) {
        if (res.data.length != 0) {
          if (params['is_first']) {
            commit('setSuperTableLabelItems', Object.keys(res.data[0]))
          }
          commit('setSuperTableLabel', Object.keys(res.data[0]))
          // commit('setSuperTableFilterFields', Object.keys(res.data[0]))
        } else {
          commit('setSuperTableLabel', [])
        }
        commit('setSuperTableData', res.data)
        commit('setTotalSuperTable', res.count)
        commit('setSelectSuperTableDataResponse', res)
      } else {
        commit('setSelectSuperTableDataResponse', res)
      }
    })
  },
  // L728
  // selectTData
  // SELECT * FROM ${TABLE_NAME}
  select_table_data({ commit, state }, params) {
    commit('setLoadingTable', true)
    // selectData
    taos_api.select_sql(
      params['connect_info'],
      state.theDB,
      state.tableName,
      params,
    ).then(res =>{
      commit('setLoadingTable', false)
      if (res.status) {
        if (res.data.length != 0) {
          if (params['is_first']) {
            commit('setTableLabelItems', Object.keys(res.data[0]))
          }
          commit('setTableLabel', Object.keys(res.data[0]))
          // commit('setTableFilterFields', Object.keys(res.data[0]))
        } else {
          commit('setTableLabel', [])
        }
        commit('setTableData', res.data)
        commit('setTotalTable', res.count)
        commit('setSelectTableDataResponse', res)
      } else {
        commit('setSelectTableDataResponse', res)
      }
    })
  },
  // L900
  // sendSQL
  exec_raw_sql({ commit, state }, params) {
    // rawSqlWithDB
    taos_api.exec_raw_sql(
      params['connect_info'],
      state.theDB,
      params['sql'],
    ).then(res =>{
      if (res.status) {
        taos_api.updateSQLSuggestions(params['sql'])
        commit('setExecRawSQLResponse', res)
      } else {
        commit('setExecRawSQLResponse', res)
      }
    })
  },
  // -----------------------------------------------------------------------
  change_super_table_name({ commit }, stable_name) {
    commit('setSuperTableName', stable_name)
  },
  change_table_name({ commit }, table_name) {
    commit('setTableName', table_name)
  },
  change_db_info({ commit }, info) {
    commit('setDbInfo', info)
  },
}

// mutations
const mutations = {
  setTaosLinks (state, links) {
    state.links = links
    state.emitter.emit('setTaosLinks', links)
  },
  // Current link
  setCurrLink (state, link) {
    state.theLink = link
  },
  // 当前数据库
  setCurrDB (state, db_name) {
    state.theDB = db_name
  },
  setDbInfo (state, info) {
    state.dbInfo = info
  },
  // ---------------------- SUPER TABLE ------------------------------------
  setSuperTables (state, stables) {
    state.superTables = stables
  },
  setSuperTableName (state, name) {
    state.superTableName = name
  },
  setTotalSuperTable (state, count) {
    state.totalSuperTable = count
  },
  setSuperTableData (state, data) {
    state.superTableData = data
  },
  setSuperTableLabel (state, label) {
    state.superTableLabel = label
  },
  setSuperTableLabelItems (state, items) {
    state.superTableLabelItems = items
  },
  setSuperTableFilter (state, filter) {
    state.superTableFilter = filter
  },
  setSuperTableFilterFields (state, fields) {
    state.superTableFilterFields = fields
  },
  setLoadingSuperList (state, status) {
    state.loadingSuperList = status
  },
  setLoadingSuperTable (state, status) {
    state.loadingSuperTable = status
  },
  setShowSuperTableResponse (state, status) {
    state.emitter.emit('setShowSuperTableResponse', status)
  },
  setSelectSuperTableDataResponse (state, status) {
    state.emitter.emit('setSelectSuperTableDataResponse', status)
  },
  // ---------------------- TABLE ------------------------------------------
  setTables (state, tables) {
    state.tables = tables
  },
  setTableName (state, name) {
    state.tableName = name
  },
  setTotalTable (state, count) {
    state.totalTable = count
  },
  setTableData (state, data) {
    state.tableData = data
  },
  setTableLabel (state, label) {
    state.tableLabel = label
  },
  setTableLabelItems (state, items) {
    state.tableLabelItems = items
  },
  setTableFilter (state, filter) {
    state.tableFilter = filter
  },
  setTableFilterFields (state, fields) {
    state.tableFilterFields = fields
  },
  setLoadingTableList (state, status) {
    state.loadingTableList = status
  },
  setLoadingTable (state, status) {
    state.loadingTable = status
  },
  setShowTableResponse (state, status) {
    state.emitter.emit('setShowTableResponse', status)
  },
  setSelectTableDataResponse (state, status) {
    state.emitter.emit('setSelectTableDataResponse', status)
  },
  // ---------------------- STATUS -----------------------------------------
  decrementProductInventory (state, { id }) {
    const product = state.all.find(product => product.id === id)
    product.inventory--
  },

  setConnectResponse (state, status) {
    state.emitter.emit('setConnectResponse', status)
  },
  setShowDatabaseResponse (state, status) {
    state.emitter.emit('setShowDatabaseResponse', status)
  },
  setExecRawSQLResponse (state, status) {
    state.emitter.emit('setExecRawSQLResponse', status)
  },
}


export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
