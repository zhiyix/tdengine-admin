export default {
  data: function () {
    return {
      message: 'hello',
      foo: 'abc',
      database_meta_properties: [
        { "name": "name", "description": "数据库名" },
        { "name": "status", "description": "数据库状态" },
        { "name": "created_time", "description": "创建时间" },
        { "name": "ntables", "description": "数据库中表的数量，包含子表和普通表但不包含超级表" },
        { "name": "vgroups", "description": "数据库中vgroup的数量" },
        { "name": "replica", "description": "副本数" },
        { "name": "strict", "description": "强一致性(v3)" },
        { "name": "keep", "description": "数据保留的天数" },
        { "name": "pagesize", "description": "元数据存储引擎的页大小(v3)" },
        { "name": "pages", "description": "元数据存储引擎的缓存页个数(v3)" },
        { "name": "minrows", "description": "文件块中记录的最小条数" },
        { "name": "maxrows", "description": "文件块中记录的最大条数" },
        { "name": "comp", "description": "数据压缩方式" },
        { "name": "precision", "description": "时间分辨率" },
        { "name": "retentions", "description": "数据的聚合周期和保存时长(v3)" },
        { "name": "single_stable", "description": "此数据库中是否只可以创建一个超级表(v3)" },
        { "name": "cachemodel", "description": "是否在内存中缓存子表的最近数据(v3)" },
        { "name": "cachesize", "description": "缓存子表最近数据的内存大小(v3)" },
        { "name": "wal_level", "description": "WAL(Write Ahead Log) 级别" },
        { "name": "wal_fsync_period", "description": "数据落盘周期" },
        { "name": "wal_retention_period", "description": "WAL 的保存时长(v3)" },
        { "name": "wal_retention_size", "description": "WAL 的保存上限(v3)" },
        { "name": "wal_roll_period", "description": "WAL 文件切换时长(v3)" },
        { "name": "wal_segment_size", "description": "WAL 单个文件大小(v3)" },
        { "name": "stt_trigger", "description": "触发文件合并的落盘文件的个数(v3)" },
        { "name": "table_suffix", "description": "内部存储引擎根据表名分配存储的后缀长度(v3)" },
        { "name": "tsdb_pagesize", "description": "时序数据存储引擎中的页大小(v3)" },
        { "name": "update", "description": "允许更新数据" },
        { "name": "buffer", "description": "写缓存的内存块大小(v3)" },
        { "name": "blocks", "description": "内存块数(v2)" },
        { "name": "cache(MB)", "description": "内存块的大小(v2)" },
        { "name": "cachelast", "description": "是否在内存中缓存子表的最近数据(v2)" },
        { "name": "duration", "description": "单文件存储数据的时间跨度(v3)" },
        { "name": "days", "description": "数据文件存储数据的时间跨度,天(v2)" },
        { "name": "quorum", "description": "数据写入成功所需要的确认数(v2)" },
      ]
    }
  },
  methods: {
    uq(array, array1) {
      let setObj = new Set(array)
      for (let i = 0; i < array1.length; i++) {
        setObj.add(array1[i]);
      }
      return Array.from(setObj).sort();
    },
    make_db_info(db_info) {
      if (!db_info) { return [] }
      let rarray = []
      this.database_meta_properties.forEach(item => {
        if (db_info.hasOwnProperty(item['name'])) {
          rarray.push({
            "name": item['name'],
            "description": item['description'],
            "value": db_info[item['name']]
          })
        }
      })
      return rarray
    },
    ui_show_error_message(err) {
      //失败
      this.$message({
        message: err,
        type: 'error',
        duration: 3000
      });
    },
    make_ui_tree_data(array) {
      this.data = [{
        id: "db",
        label: "vehicle",
        children: array.map(s => JSON.parse(
          `{"id": "${s.name}", "label": "${s.name}(${s.tables})"}`
        ))
      }]
    },
    stratify_tables(flatten_tables) {
      /* {
      "table_name": "dnode_1",
      "created_time": "2022-10-10 01:03:44.713",
      "columns": 31,
      "stable_name": "dnodes_info",
      "uid": 562950054089406,
      "tid": 6,
      "vgId": 2
      }*/
      const stables = Array.from(new Set(flatten_tables.map(t => t.stable_name))).sort()
      const mymap = new Map();
      stables.forEach(k => mymap.set(k, []))
      flatten_tables.forEach(t => {
        if (mymap.has(t.stable_name)) {
          t["name"] = t.table_name
          t["leaf"] = true
          mymap.get(t.stable_name).push(t)
        }
      })
      const children = []
      for (const [key, value] of mymap.entries()) {
        children.push({
          "name": key || "$",
          "children": value
        })
      }
      return children
    },
    fetch_super_tables(flatten_tables) {
      /* {
      "table_name": "dnode_1",
      "created_time": "2022-10-10 01:03:44.713",
      "columns": 31,
      "stable_name": "dnodes_info",
      "uid": 562950054089406,
      "tid": 6,
      "vgId": 2
      }*/
      const stables = Array.from(new Set(flatten_tables.map(t => t.stable_name))).sort()
      return stables.map(t => JSON.parse(`{"name": "${t}"}`))
    },
    fetch_sub_tables(flatten_tables, stable_name) {
      /* {
      "table_name": "dnode_1",
      "created_time": "2022-10-10 01:03:44.713",
      "columns": 31,
      "stable_name": "dnodes_info",
      "uid": 562950054089406,
      "tid": 6,
      "vgId": 2
      }*/
      const children = []
      flatten_tables.forEach(t => {
        if (stable_name === t.stable_name) {
          t["name"] = t.table_name
          t["leaf"] = true
          children.push(t)
        }
      })
      return children
    },
    sql_format: function (source, params) {
      if (arguments.length == 1)
        return function () {
          var args = $.makeArray(arguments);
          args.unshift(source);
          return $.format.apply(this, args);
        };
      if (arguments.length > 2 && params.constructor != Array) {
        params = $.makeArray(arguments).slice(1);
      }
      if (params.constructor != Array) {
        params = [params];
      }
      $.each(params, function (i, n) {
        source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
      });
      return source;
    },
    dateFormat(fmt, date) {
      /**
       * let effectStartTime = this.utils.dateFormat('yyyy-MM-dd HH:mm', new Date())
       */
      let ret
      const opt = {
        'y+': date.getFullYear().toString(), // 年
        'M+': (date.getMonth() + 1).toString(), // 月
        'd+': date.getDate().toString(), // 日
        'H+': date.getHours().toString(), // 时
        'm+': date.getMinutes().toString(), // 分
        's+': date.getSeconds().toString(), // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
      }
      for (let k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
          fmt = fmt.replace(
            ret[1],
            ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
          )
        }
      }
      return fmt
    },
    /// 保留n位小数
    toFixed(value, n = 2) {
      /**
       * toFixed("124",2)    返回结果124.00
       */
      if (value) {
        return value.toFixed(n)
      }
      return (0.00.toFixed(n))
    },
  }
}

