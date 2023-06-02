const storage = require('../localDataStore.js')
import axios from 'axios'
/**
 * Mocking client-server processing
 */
const _products = [
  { 'id': 1, 'title': 'iPad 4 Mini', 'price': 500.01, 'inventory': 2 },
  { 'id': 2, 'title': 'H&M T-Shirt White', 'price': 10.99, 'inventory': 10 },
  { 'id': 3, 'title': 'Charli XCX - Sucker CD', 'price': 19.99, 'inventory': 5 }
]

export default {
  // L004
  async _send_request(sql, connect_info) {
    console.log("[TAOS] SQL: ", sql)
    try {
      let res = await axios.post(
        `/api/rest/sql`
        , sql, {
        auth: {
          username: connect_info.user,
          password: connect_info.password
        },
        timeout: connect_info.timeout
      })
      if (res.data.status !== undefined) {
        // Version 2.x
        if (res.data.status == 'succ') {
          // console.log("[TAOS] data: ", res.data.data)
          // console.log("[TAOS] rows: ", res.data.rows)
          // console.log("[TAOS] head: ", res.data.head)
          let head = res.data.head
          let resData = res.data.data.map(item => Object.fromEntries(head.map((a, b) => [a, item[b]])))
          return { 'status': true, 'count': res.data.rows, 'data': resData }
        } else {
          return { 'status': false, 'msg': res.data.desc, 'code': res.data.code }
        }
      }
      if (res.data.code === 0) {
        let head = res.data.column_meta.map(item => item[0])
        let resData = res.data.data.map(item => Object.fromEntries(head.map((a, b) => [a, item[b]])))
        console.log(head, resData)
        return { 'status': true, 'count': res.data.rows, 'data': resData }
      } else {
        return { 'status': false, 'msg': res.data.desc, 'code': res.data.code }
      }
    } catch (err) {
      console.error("[TAOS] _send_error: ", err)
      if (err.response) {
        return { 'status': false, 'msg': err.response.data.desc, 'code': err.response.data.code }
      } else {
        return { 'status': false, 'msg': '连接错误', 'code': -1 }
      }
    }
  },
  // L032
  show_databases(connect_info) {
    return this._send_request('SHOW DATABASES', connect_info)
  },
  async connect(connect_info) {
    return await this.show_databases(connect_info)
  },
  // L048
  async select_version(connect_info) {
    const res = await this._send_request('SELECT SERVER_VERSION()', connect_info)
    
    //处理返回的数据库数据
    if (res.status) {
      return { 'status': true, 'version': res.data[0]['server_version()'] }
    } else {
      return { 'status': false, 'version': 'unkown' }
    }
  },
  // L061
  // 添加数据库
  // createDatabase
  async show_create_table(connect_info, db_name, table_name) {
    const res = await this._send_request(`SHOW CREATE TABLE ${db_name}.\`${table_name}\``, connect_info)
    
    if (res.status) {
      if (res.data && res.data.length > 0) {
        res.data.forEach(item => {
          const sql = item['Create Table'].trim().replaceAll("`","")
          const start = sql.indexOf("USING")
          const end = sql.indexOf("TAGS")
          if (start > 0 && end > 0 && start < end) {
            item["Super Table"] = sql.substring(start+"USING".length,end).trim()
          }
        })
      }
      return res
    } else {
      return res
    }
  },
  select_subtable_from_supertable(connect_info, db_name, stable_name) {
    return this._send_request(`SELECT tbname FROM ${db_name}.\`${stable_name}\``, connect_info)
  },
  // L113
  // dropDatabase
  // L116
  // showSuperTables
  show_super_tables(connect_info, db_name, like = "") {
    let like_str = like ? ` LIKE '%${like}%'` : ''
    return this._send_request(`SHOW ${db_name}.STABLES ${like_str}`, connect_info)
  },
  // L120
  // showTables
  show_tables(connect_info, db_name, like=null){
    let like_str = like?` LIKE '%${like}%'`:''
    return this._send_request(`SHOW ${db_name}.TABLES  ${like_str}`, connect_info)
  },
  // L124
  // disTable
  describe_table(connect_info, db_name, table_name) {
    return this._send_request(`DESCRIBE ${db_name}.\`${table_name}\``, connect_info)
  },
  // L127
  // dropTable
   async drop_sub_table(connect_info, db_name, table_name, safe=true){
    return await this._send_request(`DROP TABLE ${safe?'IF EXISTS':''} ${db_name}.\`${table_name}\``, connect_info )
   },
   async drop_super_table(connect_info, db_name, table_name, safe=true){
    return await this._send_request(`DROP STABLE ${safe?'IF EXISTS':''} ${db_name}.\`${table_name}\``, connect_info )
   },
  // L130
  // insertData
  // L141
  // _time_where
  _time_where(primary_key, where, start_time, end_time) {
    where = where || ''
    if (where) {
      where += start_time ? ` and ${primary_key} > '${start_time}' ` : ''
      if (where) {
        where += end_time ? ` and ${primary_key} < '${end_time}' ` : ''
      } else {
        where += end_time ? `${primary_key} < '${end_time}' ` : ''
      }
    } else {
      where += start_time ? `${primary_key} > '${start_time}' ` : ''
      if (where) {
        where += end_time ? ` and ${primary_key} < '${end_time}' ` : ''
      } else {
        where += end_time ? `${primary_key} < '${end_time}' ` : ''
      }
    }
    return where
  },
  // L160
  // 查询数据
  // selectData
  select_sql(connect_info, db_name, table_name, params) {
    let fields = params['fields']
    let where = params['where']
    let limit = params['limit']
    let offset = params['offset']
    let order = params['order']
    let start_time = params['start_time']
    let end_time = params['end_time']
    // let end_time = 'end_time' in params ? params['end_time'] : null
    //首先查询一次，获取表的整体情况
    return this.describe_table(connect_info, db_name, table_name).then(res => {
      let primary_key = 'ts'
      if (res.status && res.data.length > 0) {
        primary_key = res.data[0].Field
      } else if (res.msg) {
        return { 'status': false, 'msg': res.msg, 'code': 99 }
      } else {
        return { 'status': false, 'msg': "DESCRIBE error", 'code': 99 }
      }

      where = this._time_where(primary_key, where, start_time, end_time)
      let s_sql = 'SELECT '
      let s_field = '*'
      if (fields && fields.length > 0) {
        s_field = ''
        fields.forEach(function (field) {
          s_field += field + ','
        });
        s_field = s_field.slice(0, -1)
      }
      s_sql += s_field + ` FROM ${db_name}.\`${table_name}\` `
      if (where) {
        s_sql += ` WHERE ${where} `
      }
      if (order === 'DESC') {
        s_sql += ` ORDER BY ${primary_key} ${order} `
      }

      if (limit != null) {
        s_sql += ` LIMIT ${limit} `
      }
      if (offset != null) {
        s_sql += ` OFFSET ${offset} `
      }

      if (limit != null) {
        return this._send_request(s_sql, connect_info).then(res => {
          return this.select_count(connect_info, db_name, table_name, primary_key, where/*, start_time, end_time*/).then(count => {
            res.count = count
            return new Promise((resolve, reject) => { resolve(res) })
          })
        })
      } else {
        return this._send_request(s_sql, connect_info)
      }
    })
  },
  // L213
  // select_count 
  select_count(connect_info, db_name, table_name, primary_key, where = '', start_time = null, end_time = null) {
    where = this._time_where(primary_key, where, start_time, end_time)
    let s_sql = 'SELECT '
    let s_field = 'count(*)'
    s_sql += s_field + ` FROM ${db_name}.\`${table_name}\` `
    if (where) {
      s_sql += ` WHERE ${where} `
    }
    // console.log(s_sql)
    return this._send_request(s_sql, connect_info).then(res => {
      if (res.status && res.data.length > 0) {
        return new Promise((resolve, reject) => { resolve(res.data[0]['count(*)']) })
      } else {
        return new Promise((resolve, reject) => { resolve(0) })
      }
    })
  },
  // L230
  // rawSql
  // L233
  // rawSqlWithDB
  async exec_raw_sql(connect_info, db_name, s_sql){
    // let dbN = dbName ? dbName : this.database
    await this._send_request(`USE ${db_name}`, connect_info)
    return await this._send_request(s_sql, connect_info)
  },
  // -----------------------------------------------------------------------
  getLinks() {
    return storage.getLinks()
  },
  async getLinksAndVersion() {
    let links = storage.getLinks()
    const requests = []
    for (let i = 0, len = links.length; i < len; i++) {
      requests.push(this.select_version({
        host: links[i].host,
        port: links[i].port,
        user: links[i].user,
        password: links[i].password
      }));
    }
    try {
      const responses = await Promise.all(requests)
      for (let j = 0; j < responses.length; j ++) {
        if (responses[j].status) {
          links[j].version = responses[j].version
        }
      }
      return links
    } catch (error) {
      // request failed
    }
  },
  updateLinks(link) {
    //保存到本地
    storage.addLink({
      name: link.name,
      host: link.host,
      port: link.port,
      user: link.user,
      password: link.password,
      version: link.version
    })
  },
  updateSQLSuggestions(sql) {
    //保存到本地
    sql = sql.trim()
    if (sql.endsWith(";")) {
      sql = sql.substring(0, sql.lastIndexOf(";"))
    }
    storage.addSQLSuggestion(sql)
  },
  updateDroppedSQL(sql, table_name) {
    //保存到本地
    sql = sql.trim()
    if (sql.endsWith(";")) {
      sql = sql.substring(0, sql.lastIndexOf(";"))
    }
    storage.addDroppedSQL(sql, table_name)
  },
}
