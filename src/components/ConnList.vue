<template>
  <div class="mainAside">
    <!-- 连接列表 -->
    <el-drawer :before-close="beforeClosedrawer" title="数据库" size="380" :visible.sync="drawer" direction="ltr">
      <div v-loading="loadingLinks">
        <el-row>
          <el-button class="linkBtn" @click="addLinkDialog = true" size="small" type="primary" plain>新建连接</el-button>
        </el-row>

        <el-menu class="menu" @open="freshDB" :unique-opened="true">
          <el-submenu :index="String(index)" :key="index" v-for="(link, index) in links">
            <template slot="title">
              <span>{{ link.name }}</span>
              <el-tag type="success" size="mini" v-if="link.version">{{ link.version }}</el-tag>
              <div class="iconWrapper3">
                <img @click.stop="addDB(index)" class="icon1" src="@/assets/img/add.png">
                <img @click.stop="freshDB(index)" class="icon1" src="@/assets/img/fresh.png">
                <img @click.stop="deleteLink(index, link.name)" class="icon1" src="@/assets/img/delete.png">
              </div>
            </template>
            <el-menu-item :index="db.name" class="menuitem" @click="alartDB(link, db.name)" :key="db.name"
              v-for="(db, index_) in link.dbs">
              <img class="icon11" src="@/assets/img/database.png">
              {{ db.name }}
              <img class="icon111" @click.stop="deleteDB(link, db.name, index)" src="@/assets/img/delete.png">
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
    </el-drawer>

    <!-- 新建连接的弹窗 -->
    <el-dialog :close-on-click-modal="false" :before-close="cancelAddLink" :visible.sync="addLinkDialog" title="新建连接">
      <el-form :model="linkForm" :ref="linkForm" class="linkformstyle" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="linkForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Host" prop="host">
          <el-input v-model="linkForm.host"></el-input>
        </el-form-item>
        <el-form-item label="Port" prop="port">
          <el-input v-model="linkForm.port"></el-input>
        </el-form-item>
        <el-form-item label="User" prop="user">
          <el-input v-model="linkForm.user"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input type="password" v-model="linkForm.password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddLink" size="medium">取 消</el-button>
        <el-button type="primary" @click="confirmAddLink" size="medium">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import taos_mixin from '../mixins/taos'
export default {
  name: 'ConnList',
  props: {
    msg: String
  },
  mixins: [taos_mixin],
  computed: {
    ...mapState({
      links: state => state.taos.links,
      theDB: state => state.taos.theDB,
      emitter: state => state.taos.emitter
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    })
  },
  data: function () {
    return {
      loadingLinks: false,        // 27
      drawer: true,               // 28
      addLinkDialog: false,       // 29
      linkForm: {                 // 30
        name: "localhost",
        host: "tdengine",
        port: "6041",
        user: "root",
        password: "taosdata",
      },
      activeTab: "1",             // 37
    }
  },
  methods: {
    // L119
    beforeClosedrawer() {
      if (this.theDB) {
        this.drawer = false
      } else {
        this.$message({
          message: '请选择数据库',
          type: 'warning',
          duration: 1000
        });
      }
    },
    // L127
    cancelAddLink() {
      this.addLinkDialog = false
      //清空表单
      this.linkForm = {
        name: "",
        host: "",
        port: "",
        user: "",
        password: ""
      }
    },
    // L138
    confirmAddLink(event) {
      let connect_info = {
        name: this.linkForm.name,
        host: this.linkForm.host,
        port: this.linkForm.port,
        user: this.linkForm.user,
        password: this.linkForm.password
      }
      this.$store.dispatch('taos/connect', connect_info)
    },
    // L208
    freshDB(key) {
      let _link = this.links[key]
      let connect_info = {
        host: _link.host,
        port: _link.port,
        user: _link.user,
        password: _link.password,
        database_key: key,
      }
      this.loadingLinks = true
      this.$store.dispatch('taos/show_databases', connect_info)
    },
    // L381
    alartDB(link, db_name) {
      //切换数据库前先清空表
      this.$store.dispatch('taos/change_db_info', 
        this.make_db_info({"name": db_name, "info": link.dbs})
      ) // dbInfo
      this.$store.dispatch('taos/clear_super_table')
      this.$store.dispatch('taos/clear_table')

      //更新超级表页
      this.drawer = false
      this.activeTab = "1"
      this.$store.dispatch('taos/show_super_tables', {
        "connect_info": {
          host: link.host,
          port: link.port,
          user: link.user,
          password: link.password
        },
        "db": db_name
      }) // freshSurperTables()
    },
  },
  mounted() {
    this.emitter.on("setConnectResponse", (res) => {
      console.log("[ConnList] setConnectResponse: ", res)
      if (res != undefined && res != null) {
        if (res.status) {
          //关闭新建连接的弹窗
          this.addLinkDialog = false
          //清空表单
          /*this.linkForm = {
            name: "",
            host: "",
            port: "",
            user: "",
            password: "",
          }*/
        } else if(res.msg) {
          //连接失败
          this.$message({
            message: res.msg,
            type: 'error',
            duration: 3000
          });
        }
      }
    });
    this.emitter.on("setShowDatabaseResponse", (res) => {
      console.log("[ConnList] setShowDatabaseResponse: ", res)
      this.loadingLinks = false
      if (res != undefined && res != null) {
        if (res.status) {
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
      }
    });
    this.emitter.on("setShowSuperTableResponse", (res) => {
      console.log("[ConnList] setShowSuperTableResponse: ", res)
      if (res != undefined && res != null) {
        if (res.status) {
          // 拉取超级表成功
          this.$message({
            message: '超级表刷新成功',
            type: 'success',
            duration: 1000
          });
        } else if(res.msg) {
          // 拉取失败
          this.$message({
            message: res.msg,
            type: 'error',
            duration: 3000
          });
        }
      }
    });
    this.emitter.on("setTaosLinks", (links) => {
      console.log("[ConnList]", links)
    });
    this.$store.dispatch('taos/init_links');
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
