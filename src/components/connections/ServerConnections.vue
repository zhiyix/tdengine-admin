<template>
  <div class="mainAside">
    <!-- 连接列表 -->
    <el-drawer :before-close="beforeClosedrawer" title="Connections" size="380" :visible.sync="uiDrawerVisible" direction="ltr">
      <div v-loading="uiLoadingConnections">
        <el-row>
          <el-button class="linkBtn" @click="uiAddConnectionDialog = true" size="small" type="primary" plain>新建连接</el-button>
        </el-row>

        <el-menu class="menu" @open="doListDatabases" :unique-opened="true">
          <el-submenu :index="String(index)" :key="index" v-for="(connection, index) in connections">
            <template slot="title">
              <span>{{ connection.name }}</span>
              <el-tag type="success" size="mini" v-if="connection.version">{{ connection.version }}</el-tag>
              <div class="iconWrapper3">
                <img @click.stop="addDB(index)" class="icon1" src="@/assets/img/add.png">
                <img @click.stop="doListDatabases(index)" class="icon1" src="@/assets/img/fresh.png">
                <img @click.stop="deleteLink(index, connection.name)" class="icon1" src="@/assets/img/delete.png">
              </div>
            </template>
            <el-menu-item class="menuitem" :index="db.name" :key="db.name" v-for="(db, index_) in connection.databases"
              @click="alartDB(connection, db.name)" >
              <img class="icon11" src="@/assets/img/database.png">
              {{ db.name }}
              <img class="icon111" @click.stop="deleteDB(connection, db.name, index)" src="@/assets/img/delete.png">
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
    </el-drawer>

    <!-- 新建连接的弹窗 -->
    <el-dialog :close-on-click-modal="false" :before-close="cancelAddConnection" :visible.sync="uiAddConnectionDialog" title="新建连接">
      <el-form :model="addConnectionForm" :ref="addConnectionForm" class="addConnectionFormstyle" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="addConnectionForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Host" prop="host">
          <el-input v-model="addConnectionForm.host"></el-input>
        </el-form-item>
        <el-form-item label="Port" prop="port">
          <el-input v-model="addConnectionForm.port"></el-input>
        </el-form-item>
        <el-form-item label="User" prop="user">
          <el-input v-model="addConnectionForm.user"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input type="password" v-model="addConnectionForm.password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddConnection" size="medium">取 消</el-button>
        <el-button type="primary" @click="doAddConnection" size="medium">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import taos_mixin from '../../mixins/taos'
export default {
  name: 'ServerConnections',
  props: {
    msg: String
  },
  mixins: [taos_mixin],
  computed: {
    ...mapState({
      theDB: state => state.taos_tree.theDB,
      emitter: state => state.taos_tree.emitter
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    })
  },
  data: function () {
    return {
      uiLoadingConnections: false,        // 27
      uiDrawerVisible: true,                       // 28
      uiAddConnectionDialog: false,       // 29
      addConnectionForm: {                // 30
        name: "localhost",
        host: "tdengine",
        port: "6041",
        user: "root",
        password: "taosdata",
      },
      activeTab: "1",             // 37
      /** 
       * #Array
       * host: "tdengine"
       * name: "localhost"
       * password: "taosdata"
       * port: "6041"
       * user: "root"
       * version: "3.0.4.2"
       * databases: [       * 
       * name: "information_schema"
       * name: "performance_schema"
       * ]
       */
      connections: [], // 96
    }
  },
  methods: {
    // L119
    beforeClosedrawer() {
      if (this.theDB) {
        this.uiDrawerVisible = false
      } else {
        this.$message({
          message: '请选择连接',
          type: 'warning',
          duration: 1000
        });
      }
    },
    // L127
    cancelAddConnection() {
      this.uiAddConnectionDialog = false
      //No 清空表单
    },
    // L138
    async doAddConnection(event) {
      const connect_info = {
        name: this.addConnectionForm.name,
        host: this.addConnectionForm.host,
        port: this.addConnectionForm.port,
        user: this.addConnectionForm.user,
        password: this.addConnectionForm.password
      }
      const res = await this.$store.dispatch('taos_connections/connect', connect_info)
      if (res.status) {
        //关闭新建连接的弹窗
        this.uiAddConnectionDialog = false
        //No 清空表单
      } else if(res.msg) {
        //连接失败
        this.$message({
          message: res.msg,
          type: 'error',
          duration: 3000
        });
      }
    },
    // L208
    doListDatabases(key) {
      const _link = this.connections[key]
      const connect_info = {
        host: _link.host,
        port: _link.port,
        user: _link.user,
        password: _link.password,
      }
      this.uiLoadingConnections = true
      this.$store.dispatch('taos_connections/select_databases', connect_info).then(res => {
        this.uiLoadingConnections = false
        if (res.status) {
          this.connections[key].databases = res.data
          this.$message({
            message: '数据库刷新成功',
            type: 'success',
            duration: 1000
          });
        } else if(res.msg) {
          //连接失败，1.提示 2.删除当前连接 3.重新连接
          //1
          this.$message({
            message: res.msg,
            type: 'error',
            duration: 3000
          });
          // 2
          // 3
        }
      })
    },
    // L381
    alartDB(connection, db_name) {
      //切换数据库前先清空表
      this.$store.dispatch('taos_tree/change_link_and_db', [connection, db_name]) 

      //更新超级表页
      this.uiDrawerVisible = false
    },
  },
  async mounted() {
    this.emitter.on("setErrorResponse", (err) => {
      this.ui_show_error_message(err)
    })
    this.connections = await this.$store.dispatch('taos_connections/init')
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.mainAside {
  //height: 100%;

  .linkBtn {
    width: 90%;
  }

  .menu {
    overflow-y: auto;
    height: 650px;

    .iconWrapper3 {
      display: inline;
      position: absolute;
      right: 54px;

      .icon1 {
        height: 16px;
        width: 16px;
        position: relative;
        top: 2px;
        cursor: pointer;
        z-index: 111;
      }
    }

    .menuitem {
      .icon11 {
        height: 16px;
        width: 16px;
        position: relative;
        bottom: 1px;
        right: 8px;
      }

      .icon111 {
        height: 16px;
        width: 16px;
        position: absolute;
        top: 19px;
        right: 8px;
      }
    }
  }
}
</style>
