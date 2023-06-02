<template>
  <el-container class="panelWrapper">
    <el-aside class="sideWrapper" width="251px">
      <!-- 表列表 -->
      <TaosTree :connection="connection" @select="onTreeNodeClicked"/>
    </el-aside>
    <el-main class="mainWrapper">
      <el-tabs v-model="uiActiveTab" type="border-card" class="mainTab" @tab-click="handle_swich_tab">
        <el-tab-pane label="表" class="tablePage" name="1">
          <taos-tables :super="uiIsSuperTable" :db="uiSelectDatabaseData" 
            :stable="uiSelectSuperTable" :table="uiSelectSubTable"/>
        </el-tab-pane>
        <el-tab-pane label="控制台" name="3">
          <taos-consoles :db="uiSelectDatabaseData" />
        </el-tab-pane>
        <el-tab-pane label="测试" name="4">
          <taos-test :db="uiSelectDatabaseData" ref="test"/>
        </el-tab-pane>
        <el-tab-pane label="当前数据库属性" name="5">
          <taos-properties :db="uiSelectDatabaseData" />
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import TaosTree from './tree/index.vue'
import TaosProperties from './tables/properties.vue'
import TaosConsoles from './tables/console.vue'
import TaosTest from './tables/test.vue'
import TaosTables from './tables/tables.vue'

export default {
  name: 'TaosMain',
  components: {
    TaosTree,
    TaosTables,
    TaosConsoles,
    TaosTest,
    TaosProperties
  },
  computed: {
    ...mapState({
      // theDB: state => state.taos_connections.theDB, // 当前数据库
      theLink: state => state.taos_connections.theLink, // 当前连接
      emitter: state => state.taos_connections.emitter
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    })
  },
  data: function () {
    return {
      uiActiveTab: "1", // L37
      connection: {},  
      uiIsSuperTable: false,
      uiSelectDatabaseData: null,
      uiSelectSuperTable: null,
      uiSelectSubTable: null,
    }
  },
  watch: {
    theLink(val) {
      const connect_info = {
        host: val.host,
        port: val.port,
        user: val.user,
        password: val.password,
        // database: this.theDB,
      }
      this.connection = connect_info
    },
  },
  methods: {
    handle_swich_tab(tab) {
      switch (tab.name) {
        case "1":
          //超级表
          break;
        case "2":
          //表
          break;
        case "tree":
          break;
        case "3":
          //控制台
          break;
        case "4":
          //Test
          this.$nextTick(() => this.$refs.test.start())
          break;
        case "5":
          //数据库属性
          break;
      }
    },
    onTreeNodeClicked(level, node, isuper, superNode, subNode) {
      console.log(node, isuper, superNode, subNode)
      switch (level) {
        case 1:
          this.uiSelectDatabaseData = node
          break;
        case 2:
          this.uiSelectSubTable = null
          this.uiIsSuperTable = isuper
          this.uiSelectSuperTable = superNode
          // Database
          this.uiSelectDatabaseData = node
          break;
        case 3:
          this.uiSelectSubTable = subNode
          this.uiIsSuperTable = isuper
          this.uiSelectSuperTable = superNode
          // Database
          this.uiSelectDatabaseData = node
          break;
      }
    }
  },
  mounted() {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.panelWrapper {
  height: 100%;

  .mainWrapper {
    .mainTab {

      width: 100%;
      border: none;
      box-shadow: none;

      .tablePage {
        // height: 90%;
        height: calc(100vh - 110px);
      }
    }
  }
}
</style>