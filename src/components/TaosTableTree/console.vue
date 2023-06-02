<template>
  <div class="consoleWrapper">
    <el-autocomplete class="inline-input" v-model="consoleInput" placeholder="请输入内容" :fetch-suggestions="querySuggestionsAsync"
      @select="sendSQL">
      <template slot="prepend">TAOS:</template>
      <el-button slot="append" icon="el-icon-s-promotion" @click="sendSQL"></el-button>
    </el-autocomplete>
    <div class="resultPlace">
      <!-- <el-input :rows='1000' type="textarea" placeholder="运行结果" v-model="consoleResult" :disabled="true"></el-input> -->
      <!-- <div style="height:100%;overflow-y:auto" class="resultPlaceTitle">{{ consoleResult }}</div>-->
      <json-viewer style="height:100%;overflow-y:auto" class="resultPlaceTitle_" :expand-depth=5 copyable unboxed
        :value="consoleResult"></json-viewer>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import JsonViewer from 'vue-json-viewer'
const storage = require('@/localDataStore.js')

import taos_mixin from '../../mixins/taos'

export default {
  name: "TaosConsoles",
  components: {
    JsonViewer
  },
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
    },
  },
  data: function () {
    return {
      consoleResult: '', // L26
      consoleInput: "", // L107
      sqlTemplates: [
        "SHOW DATABASES;",
        "SHOW CREATE DATABASE log;",
        "SHOW log.TABLES",
        "SHOW CREATE TABLE log.`log`;",
        "SELECT COUNT(*) FROM log.`log`;",
        "SHOW VARIABLES;",
        "SHOW DNODES;",
        "SHOW MNODES;",
        "SHOW ServerConnections;",
        "SHOW FUNCTIONS;",
        "SHOW USERS;",
      ]
    }
  },
  methods: {
    // L900
    async sendSQL() {
      // rawSqlWithDB()
      const res = await this.$store.dispatch('taos_tree/exec_raw_sql', {
        "connect_info": this.connect_info,
        "db_name": this.db,
        "sql": this.consoleInput,
      })
      if (res.status) {
        // let info = ''
        // info += `数据数量:&nbsp;&nbsp;${data.count}<br/>`
        // info += `数据列:&nbsp;&nbsp;${data.head}<br/>`
        // info += `数据:&nbsp;&nbsp;${data.data}<br/>`
        this.$message({
          message: '执行成功',
          type: 'success',
          duration: 500
        });
        this.consoleResult = res.data
      } 
    },
    querySuggestionsAsync(queryString, cb) {
      var suggestions = this.uq(
        storage.getSQLSuggestions().map(s => s.value), 
        this.sqlTemplates
      )
      suggestions = suggestions.map(function(item, index, array){
        return {"value": item}
      })
      var results = queryString ? suggestions.filter(this.createSuggestionFilter(queryString)) : suggestions;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        // 调用 callback 返回建议列表的数据
        cb(results);
      }, 30 * Math.random());
    },
    createSuggestionFilter(queryString) {
      return (suggestion) => {
        return (suggestion.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
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
    height: calc(100% - 55px - 2px); //92%;
    //width: 100%;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    margin-top: 15px;

    .resultPlaceTitle {
      color: #7e7e7e; //#DCDFE6;
      margin-top: 7px;
      margin-left: 10px;
    }
  }

}
</style>