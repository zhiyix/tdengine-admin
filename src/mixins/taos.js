export default {
  data: function () {
    return {
      message: 'hello',
      foo: 'abc'
    }
  },
  methods: {
    makeDbInfo(db_info) {
      dbs = db_info.info
      db_name = db_info.name
      console.log("[TAOX]", dbs)
      let info = '无法获取数据库信息'
      dbs.forEach(item => {
        if (item['name'] == db_name) {
          info = `数据库名:&nbsp;&nbsp;${db_name}<br/>`
          info += `创建时间:&nbsp;&nbsp;${item['created_time']}<br/>`
          info += `可更新:&nbsp;&nbsp;${item['update'] == 0 ? '否' : '是'}<br/>`
          info += `cache(MB):&nbsp;&nbsp;${item['cache(MB)']}<br/>`
          info += `cachelast:&nbsp;&nbsp;${item['cachelast']}<br/>`
          info += `comp:&nbsp;&nbsp;${item['comp']}<br/>`
          info += `days:&nbsp;&nbsp;${item['days']}<br/>`
          info += `fsync:&nbsp;&nbsp;${item['fsync']}<br/>`
          info += `keep0,keep1,keep(D):&nbsp;&nbsp;${item['keep0,keep1,keep(D)']}<br/>`
          info += `maxrows:&nbsp;&nbsp;${item['maxrows']}<br/>`
          info += `minrows:&nbsp;&nbsp;${item['minrows']}<br/>`
          info += `ntables:&nbsp;&nbsp;${item['ntables']}<br/>`
          info += `quorum:&nbsp;&nbsp;${item['quorum']}<br/>`
          info += `replica:&nbsp;&nbsp;${item['replica']}<br/>`
          info += `status:&nbsp;&nbsp;${item['status']}<br/>`
          info += `vgroups:&nbsp;&nbsp;${item['vgroups']}<br/>`
          info += `wallevel:&nbsp;&nbsp;${item['wallevel']}<br/>`
          info += `precision:&nbsp;&nbsp;${item['precision']}<br/>`
        }
      })
      return info
    },
    make_db_info(db_info) {
      console.log("[TAOX]", db_info.info)
      let info = []
      db_info.info.forEach(item => {
        if (item['name'] == db_info.name) {
          info.push({
            "name": "name",
            "description": "数据库名",
            "value": `${item['name']}`
          })
          info.push({ 
            "name": "status", 
            "description": "数据库状态", 
            "value": `${item['status']}` 
          })
          info.push({ 
            "name": "version", 
            "description": "数据库版本", 
            "value": `${db_info.version}` 
          })
          info.push({ 
            "name": "create_time", 
            "description": "创建时间", 
            "value": `${item['created_time']}` 
          })
          info.push({ 
            "name": "ntables", 
            "description": "数据库中表的数量，包含子表和普通表但不包含超级表", 
            "value": `${item['ntables']}` 
          })
          info.push({ 
            "name": "vgroups", 
            "description": "数据库中vgroup的数量", 
            "value": `${item['vgroups']}` 
          })
          info.push({ 
            "name": "replica", 
            "description": "副本数", 
            "value": `${item['replica']}` 
          })
          info.push({ 
            "name": "strict", 
            "description": "强一致性(v3)", 
            "value": `${item['strict'] || ''}` 
          })
          info.push({ 
            "name": "duration", 
            "description": "单文件存储数据的时间跨度(v3)", 
            "value": `${item['duration'] || ''}` 
          })
          info.push({ 
            "name": "keep", 
            "description": "数据保留时长", 
            "value": `${item['keep']}` 
          })
          info.push({ 
            "name": "buffer", 
            "description": "写缓存的内存块大小(v3)", 
            "value": `${item['buffer'] || ''}` 
          })
          info.push({ 
            "name": "pagesize", 
            "description": "元数据存储引擎的页大小(v3)", 
            "value": `${item['pagesize'] || ''}` 
          })
          info.push({ 
            "name": "pages", 
            "description": "元数据存储引擎的缓存页个数(v3)", 
            "value": `${item['pages'] || ''}` 
          })
          info.push({ 
            "name": "minrows", 
            "description": "文件块中记录的最小条数", 
            "value": `${item['minrows']}` 
          })
          info.push({ 
            "name": "maxrows", 
            "description": "文件块中记录的最大条数", 
            "value": `${item['maxrows']}` 
          })
          info.push({ 
            "name": "comp", 
            "description": "数据压缩方式", 
            "value": `${item['comp']}` 
          })
          info.push({ 
            "name": "precision", 
            "description": "时间分辨率", 
            "value": `${item['precision']}` 
          })
          info.push({ 
            "name": "retentions", 
            "description": "数据的聚合周期和保存时长(v3)", 
            "value": `${item['retentions'] || ''}` 
          })
          info.push({ 
            "name": "single_stable", 
            "description": "此数据库中是否只可以创建一个超级表(v3)", 
            "value": `${item['single_stable'] || ''}` 
          })
          info.push({ 
            "name": "cachemodel", 
            "description": "是否在内存中缓存子表的最近数据(v3)", 
            "value": `${item['cachemodel'] || ''}` 
          })
          info.push({ 
            "name": "cachesize", 
            "description": "缓存子表最近数据的内存大小(v3)", 
            "value": `${item['cachesize'] || ''}` 
          })
          info.push({ 
            "name": "wal_level", 
            "description": "WAL 级别", 
            "value": `${item['wallevel'] || item['wal_level'] || ''}` 
          })
          info.push({ 
            "name": "wal_fsync_period", 
            "description": "数据落盘周期(v3)", 
            "value": `${item['wal_fsync_period'] || ''}` 
          })
          info.push({ 
            "name": "wal_retention_period", 
            "description": "WAL 的保存时长(v3)", 
            "value": `${item['wal_retention_period'] || ''}` 
          })
          info.push({ 
            "name": "wal_retention_size", 
            "description": "WAL 的保存上限(v3)", 
            "value": `${item['wal_retention_size'] || ''}` 
          })
          info.push({ 
            "name": "wal_roll_period", 
            "description": "WAL 文件切换时长(v3)", 
            "value": `${item['wal_roll_period'] || ''}` 
          })
          info.push({ 
            "name": "wal_segment_size", 
            "description": "WAL 单个文件大小(v3)", 
            "value": `${item['wal_segment_size'] || ''}` 
          })
          info.push({ 
            "name": "stt_trigger", 
            "description": "触发文件合并的落盘文件的个数(v3)", 
            "value": `${item['stt_trigger'] || ''}` 
          })
          info.push({ 
            "name": "table_suffix", 
            "description": "内部存储引擎根据表名分配存储的后缀长度(v3)", 
            "value": `${item['table_suffix'] || ''}` 
          })
          info.push({ 
            "name": "tsdb_pagesize", 
            "description": "时序数据存储引擎中的页大小(v3)", 
            "value": `${item['tsdb_pagesize'] || ''}` 
          })
          info.push({ 
            "name": "update", 
            "description": "可更新", 
            "value": `${item['update'] == 0 ? '否' : '是'}` 
          })
          info.push({ 
            "name": "blocks", 
            "description": "v2", 
            "value": `${item['blocks'] || ''}` 
          })
          info.push({ 
            "name": "cache(MB)", 
            "description": "v2", 
            "value": `${item['cache(MB)'] || ''}` 
          })
          info.push({ 
            "name": "cachelast", 
            "description": "v2", 
            "value": `${item['cachelast'] || ''}` 
          })
          info.push({ 
            "name": "days", 
            "description": "v2", 
            "value": `${item['days'] || ''}` 
          })
          info.push({ 
            "name": "fsync", 
            "description": "v2", 
            "value": `${item['fsync'] || ''}` 
          })
          info.push({ 
            "name": "quorum", 
            "description": "v2", 
            "value": `${item['quorum'] || ''}` 
          })
        }
      })
      return info
    },
  }
}

