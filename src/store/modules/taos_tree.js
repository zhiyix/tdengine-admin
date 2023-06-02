import taos_api from '../../api/taos'
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
  // SHOW DATABASES
  async connect ({ commit, state }, connect_info) {
    const conn_res = await taos_api.connect(connect_info)
    if (conn_res.status) {
      const select_res = await taos_api.select_version(connect_info)
      taos_api.updateLinks({
        name: connect_info.name, 
        host: connect_info.host, 
        port: connect_info.port, 
        user: connect_info.user, 
        password: connect_info.password,
        version: select_res.version
      })
      return { 'status': true, 'data': taos_api.getLinks() }
    } else {
      return conn_res 
    }
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
  //------------------------------------------------------------------------------------------------------
  // SHOW DATABASES
  show_databases({ commit, state }, connect_info) {
    return taos_api.show_databases(connect_info).then(res => {
      if (!res.status) {
        commit('setErrorResponse', res)
      }
      return res
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
  //-------------------------------------------------------------------------------------------------------------------------
  // L531 showTables
  // SELECT * FROM ${TABLE_NAME}
  show_sub_tables({ commit, state }, params) {
    // showTables
    // 0: connect_info, 1: super_table_name
    return taos_api.show_tables(params[0], params[1]).then(res => {
      if (!res.status) {
        commit('setErrorResponse', res)
      }
      return res
    })
  },
  //-------------------------------------------------------------------------------------------------------------------------
  // L568
  // 查询数据
  // SELECT * FROM ${TABLE_NAME}
  select_super_table_data({ commit, state }, params) {
    // selectData
    return taos_api.select_sql(
      params['connect_info'],
      params['db_name'],
      params['table_name'],
      params,
    ).then(res =>{
      if (!res.status) {
        commit('setErrorResponse', res)
      }
      return res
    })
  },
  // L728
  // selectTData
  // SELECT * FROM ${TABLE_NAME}
  // L815
  // dropTable
  drop_super_table ({ commit, state }, params) {
    commit('setLoadingSuperList', true)

    taos_api.show_create_table(
      params['connect_info'],
      params['db'],
      params['table_name']
    ).then(res => {
      if (res.status && res.data.length > 0) {
        res.data.forEach(item => {
          if (item["Table"] == params['table_name']) {
            taos_api.updateDroppedSQL(item["Create Table"], params['table_name'])
            // >> dropTable
            taos_api.drop_super_table(
              params['connect_info'], 
              params['db'],
              params['table_name']
            ).then(res => {
              console.log("-------------", res)
              if (res.status) {
                // commit('setTables', res.data)
                if (params['cb']) {params['cb']()}
                commit('setDropSuperTableResponse', res)
                commit('setLoadingSuperList', false)
              } else {
                commit('setDropSuperTableResponse', res)
                commit('setLoadingSuperList', false)
              }
            })
            // << dropTable
          }
        });
      }
    })
  },
  //---------------------------------------------------------------------------------
  // L859
  // dropTable
  async drop_sub_table ({ commit, state }, params) {
    const res1 = await taos_api.show_create_table(
        params['connect_info'],
        params['db'],
        params['table_name']
      )
      
    if (res1.status && res1.data.length > 0) {
      res1.data.forEach(item => {
        if (item["Create Table"] && item["Table"] == params['table_name']) {
          taos_api.updateDroppedSQL(item["Create Table"], params['table_name'])
        }
      })
    }
    // >> dropTable
    return await taos_api.drop_sub_table(
      params['connect_info'], 
      params['db'],
      params['table_name']
    )
    // << dropTable
  },
  // -------------------------------------------------------------------------------------------------
  // L900
  // sendSQL
  async exec_raw_sql({ commit, state }, params) {
    // rawSqlWithDB
    const res = await taos_api.exec_raw_sql(
      params['connect_info'],
      params['db_name'],
      params['sql'],
    )
    if (res.status) {
      taos_api.updateSQLSuggestions(params['sql'])
    } else {
      commit('setErrorResponse', res)
    }
    return res
  },
  // -----------------------------------------------------------------------
  change_super_table_name({ commit }, stable_name) {
    commit('setSuperTableName', stable_name)
  },
  change_table_name({ commit }, table_name) {
    commit('setTableName', table_name)
  },
  change_link_and_db({ commit }, link_db) {
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
