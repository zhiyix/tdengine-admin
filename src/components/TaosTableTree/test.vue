<template>
  <div class="consoleWrapper">
    <el-timeline class="resultPlace" :reverse="reverse">
      <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.timestamp"
        :type="activity.type" placement="top">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>{{ activity.content }}</span>
          </div>
          <code class="resultPlaceTitle">{{ activity.result || activity.template }}</code>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
const storage = require('@/localDataStore.js')

import taos_mixin from '../../mixins/taos'

export default {
  name: "TaosConsoles",
  mixins: [taos_mixin],
  props: {
    db: Object,
  },
  computed: {
    ...mapState({
      theLink: state => state.taos_tree.theLink, // 当前连接
      emitter: state => state.taos_tree.emitter
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    })
  },
  watch: {
    theLink(val) {
      this.connect_info = {
        host: val.host,
        port: val.port,
        user: val.user,
        password: val.password,
      }
    }
  },
  data: function () {
    return {
      test_db_name: "__taos__test",
      reverse: false,
      activities: [{
        content: '创建数据库',
        template: t => `CREATE DATABASE {db_name} PRECISION 'ms' KEEP 365`,
        timestamp: ''
      }, {
        content: '显示系统所有数据库',
        template: `SHOW DATABASES`,
        timestamp: ''
      }, {
        content: '使用数据库',
        template: t => `USE {db_name}`,
        timestamp: ''
      }, {
        content: '创建超级表',
        template: t => `CREATE STABLE {db_name}.meters (ts timestamp, current float, voltage int, phase float) ` +
          `TAGS (location binary(64), groupId int)`,
        timestamp: ''
      }, {
        content: '自动建表',
        template: t => `INSERT INTO {db_name}.d1001 USING {db_name}.meters TAGS ("California.SanFrancisco", 2) VALUES (now, 10.2, 219, 0.32)`,
        timestamp: ''
      }, {
        content: '查询数据',
        template: t => `SELECT * FROM {db_name}.d1001 WHERE voltage > 215 order by ts desc limit 2`,
        timestamp: ''
      }, {
        content: '查询缓存',
        template: t => `SELECT LAST(*) FROM {db_name}.meters WHERE location='California.SanFrancisco'`,
        timestamp: ''
      }, {
        content: '所有的子表及标签信息',
        template: t => `SELECT TBNAME, location FROM {db_name}.meters`,
        timestamp: ''
      }, {
        content: '删除数据库',
        template: t => `DROP DATABASE IF EXISTS {db_name}`,
        timestamp: ''
      }]
    }
  },
  methods: {
    // L900
    async start() {
      // rawSqlWithDB()
      let tpl = null
      for (let ii = 0; ii < this.activities.length; ii++) {
        const element = this.activities[ii]
        if (typeof (element.template) == 'function') {
          tpl = element.template().format({ db_name: this.test_db_name })
        } else {
          tpl = element.template.format({ db_name: this.test_db_name })
        }
        const res = await this.$store.dispatch('taos_tree/exec_raw_sql', {
          "connect_info": this.connect_info,
          "db_name": this.test_db_name,
          "sql": tpl,
        })
        this.activities[ii].result = tpl
        if (res.status) {
          console.log(res.data)
          this.activities[ii].type = 'success'
          this.activities[ii].timestamp = this.dateFormat('HH:mm:ss', new Date())
        } else {
          this.activities[ii].type = 'danger'
          console.error("[TAOS.TEST]", res.msg)
          this.ui_show_error_message(res.msg)
        }
      }
      this.$message({
        message: '执行完成',
        type: 'success',
        duration: 1000
      });
    },
  },
  mounted() {
    this.emitter.on("setErrorResponse", (err) => {
      this.ui_show_error_message(err)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.consoleWrapper {
  height: 100%;
  width: 100%;

  .resultPlace {
    //height: calc(100% - 55px - 2px); //92%;
    //width: 100%;
    //border: 1px solid #DCDFE6;
    border-radius: 4px;
    margin: 15px;

    .resultPlaceTitle {
      color: #7e7e7e; //#DCDFE6;
      margin-top: 7px;
      margin-left: 10px;
    }
  }

}
</style>