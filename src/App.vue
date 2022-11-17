<template>
  <div id="app">
    <ConnList ref="superTable" />
    <el-container class="main">
      <el-container class="mainContent">
        <el-tabs v-model="activeTab" type="border-card" class="mainTab" @tab-click="handleSwichTab">
          <el-tab-pane label="超级表" class="tablePage" name="1">
            <TaosSuperTable ref="super_table_ref" />
          </el-tab-pane>
          <el-tab-pane label="表" class="tablePage" name="2">
            <TaosTables ref="table_ref" />
          </el-tab-pane>
          <el-tab-pane label="控制台" name="3">
            <TaosConsole ref="console_ref" />
          </el-tab-pane>
          <el-tab-pane label="当前数据库属性" name="4">
            <el-table :data="dbInfo" border style="width: 100%">
              <el-table-column prop="name" label="列名" width="180">
              </el-table-column>
              <el-table-column prop="value" label="数据" width="240">
              </el-table-column>
              <el-table-column prop="description" label="说明">
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-container>
      <el-footer>
        <el-button class="switchBtn" @click="drawer = true" type="text" size="small">
          <img class="icon" src="@/assets/img/switch.png" />
          切换
        </el-button>
        <div class="footTextWrapper">

        </div>
        <div class="footText">当前连接:</div>
        <div class="footText greyText">{{ theLink.name }}</div>
        <div class="footText">主机:</div>
        <div class="footText greyText">{{ theLink.host }}</div>
        <div class="footText">端口:</div>
        <div class="footText greyText">{{ theLink.port }}</div>
        <div class="footText">用户名:</div>
        <div class="footText greyText">{{ theLink.user }}</div>
        <div class="footText">数据库:</div>
        <div class="footText greyText">{{ theDB }}</div>
        <div class="footText">发布:</div>
        <div class="footText greyText">v0.2.3</div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { currency } from './currency'
import ConnList from './components/ConnList.vue'
import TaosSuperTable from './components/TaosSuperTable.vue'
import TaosTables from './components/TaosTables.vue'
import TaosConsole from './components/TaosConsole.vue'

export default {
  name: 'App',
  components: {
    ConnList,
    TaosSuperTable,
    TaosTables,
    TaosConsole
  },
  computed: {
    ...mapState({
      dbInfo: state => state.taos.dbInfo,
      theDB: state => state.taos.theDB, // 当前数据库
      theLink: state => state.taos.theLink, // 当前连接
      emitter: state => state.taos.emitter
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    })
  },
  data: function () {
    return {
      activeTab: "1", // L37
    }
  },
  methods: {
    currency,
    // L563
    handleSwichTab(tab) {
      switch (tab.name) {
        case "1":
          //超级表
          this.$refs.super_table_ref.freshSuperTables()
          break;
        case "2":
          //表
          this.$refs.table_ref.freshTables()
          break;
        case "3":
          //控制台
          break;
        case "4":
          //数据库属性
          break;
      }
    },
  },
  mounted() {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;

  .main {
    height: 100%;

    .mainContent {
      height: 100%;

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

    .switchBtn {
      position: relative;
      bottom: 1px;

      .icon {
        height: 12px;
        width: 12px;
        position: relative;
        top: 1px;
      }
    }

    .footTextWrapper {
      margin-left: 10px;
    }

    .footText {
      margin-left: 10px;
      font-size: 13px;
      color: #444;
    }

    .greyText {
      color: #606266;
    }
  }
}
</style>
