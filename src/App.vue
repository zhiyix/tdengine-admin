<template>
  <div id="app">
    <ServerConnections ref="superTable" />
    <el-container class="main">
      <el-container class="mainContent">
        <TaosTableTree ref="tree_ref" />
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
        <div class="footText greyText">v0.2.5</div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { currency } from './currency'
import ServerConnections from './components/connections/ServerConnections.vue'
import TaosTableTree from './components/TaosTableTree'

export default {
  name: 'App',
  components: {
    ServerConnections,
    TaosTableTree
  },
  computed: {
    ...mapState({
      theDB: state => state.taos_tree.theDB, // 当前数据库
      theLink: state => state.taos_tree.theLink, // 当前连接
      emitter: state => state.taos_tree.emitter
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    })
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
