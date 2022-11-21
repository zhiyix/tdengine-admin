<template>
  <el-container class="panelWrapper">
    <el-aside class="sideWrapper" width="251px" v-loading="uiLoadingTree">
      <!-- 表列表 -->
      <el-input placeholder="输入关键字进行过滤" v-model="filterText">
      </el-input>
      <el-tree class="filter-tree" lazy :data="uiTreeData" :props="defaultProps" node-key="name"
        default-expand-all :expand-on-click-node="false" :filter-node-method="filter_tree_node" 
        :load="load_tree_node" @node-click="on_tree_node_click" ref="tree">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span class="iconWrapper2">
            <i class="el-icon-delete" @click.stop="remove_tree_node(node, data)" v-if="node.level>1"></i>
          </span>
        </span>
      </el-tree>
      <el-dialog title="搜索表" :visible.sync="Tdialog" width="30%" :before-close="closeTdialog">
        <el-input v-model="TdialogText">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="closeTdialog">取 消</el-button>
          <el-button size="small" type="primary" @click="searchTList">确 定</el-button>
        </span>
      </el-dialog>
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
import TaosProperties from './properties.vue'
import TaosConsoles from './console.vue'
import TaosTest from './test.vue'
import TaosTables from './tables.vue'

import taos_mixin from '../../mixins/taos'

export default {
  name: "TaosTableTree",
  mixins: [taos_mixin],
  components: {
    TaosTables,
    TaosConsoles,
    TaosTest,
    TaosProperties
  },
  computed: {
    ...mapState({
      // theDB: state => state.taos_tree.theDB, // 当前数据库
      theLink: state => state.taos_tree.theLink, // 当前连接
      emitter: state => state.taos_tree.emitter
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    }),
    fullName: function () {
      return this.TdialogText + ' ' + this.filterText
    }
  },
  data() {
    return {
      Tdialog: false, // L102
      TdialogText: "", // L103
      filterText: '',
      defaultProps: {
        id: 'name',
        label: 'name',
        isLeaf: 'leaf',
        children: 'children',
      },
      rawDatabaseData: [], // SQL Return Data
      rawTableData: [], // SQL Return Data
      selectDatabaseName: null,
      uiIsSuperTable: false,
      uiSelectDatabaseData: null,
      uiSelectSuperTable: null,
      uiSelectSubTable: null,
      uiLoadingTree: false,
      uiTreeData: [],
      uiActiveTab: "1", // L37
      uiLatestTab: null,
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    theLink(val) {
      this.connect_info = {
        host: val.host,
        port: val.port,
        user: val.user,
        password: val.password,
        // database: this.theDB,
      }
      this.init_tree_data()
    },
    rawDatabaseData(array) {
      this.uiTreeData = array
    }
  },
  methods: {
    change_curr_database(data) {
      this.uiSelectDatabaseData = data
    },
    change_sub_table_data(data) {
      this.rawTableData = []
      data.forEach(e => {
        if (!e.stable_name || e.stable_name === "") {
          e.stable_name = "()"
        }
        this.rawTableData.push(e)
      })
    },
    // L436
    searchTList() {
    },
    // L934
    closeTdialog() {
      this.TdialogText = ""
      this.Tdialog = false
    },
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
    load_tree_node(node, resolve) {
      // Database
      if (node.level === 0) {
        return resolve(this.rawDatabaseData);
      }
      // SuperTable
      if (node.level === 1) {
        if (node.data && node.data.name && node.data.name.length > 0) {
          if (node.data.name === "log") {
            return resolve([]);
          }
          this.show_sub_tables(node.data.name).then(res => {
            return resolve(res)
          })
        }
      }
      // SubTable
      if (node.level === 2) {
        if (node.data && node.data.name && node.data.name.length > 0) {
          return resolve(this.fetch_sub_tables(this.rawTableData, node.data.name))
        }
      }
      if (node.level > 2) return resolve([]);
    },
    filter_tree_node(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    append_tree_node(data) {
      const newChild = { id: id++, label: 'testtest', children: [] };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    async remove_tree_node(node, data) {
      console.log(node, data, "*******************************************************")
      const parent = node.parent
      if (node.level === 1) {
        const children = parent.data.children || parent.data
        const index = children.findIndex(d => d.id === data.id)
        children.splice(index, 1)
      } else if (node.level === 2 || node.level === 3) {
        try {
          let selectedb = null
          if (node.level === 2) {
            selectedb = node.parent && node.parent.data;
            await this.$confirm(`确认删除超级表${selectedb["name"]}.\`${data["name"]}\`吗？`)
          } else if (node.level === 3) {
            selectedb = node.parent && node.parent.parent && node.parent.parent.data;
            await this.$confirm(`确认删除表${selectedb["name"]}.\`${data["name"]}\`吗？`)
          } 

          if (selectedb && selectedb["name"] && data["name"]) {
            const res = await this.$store.dispatch('taos_tree/drop_sub_table', {
              "connect_info": this.connect_info,
              "db": selectedb["name"],
              "table_name": data["name"],
            }) // dropTable()
            if (res.status) {
              this.$refs.tree.remove(node)
            } else {
              this.ui_show_error_message(res.msg)
            }
          } else {
            console.warn("[TAOTREE] No valid table selected.")
          }
        } catch (error) {
          this.$message({
            message: '操作已取消',
            type: 'warning',
            duration:500
          })
        }
      }
    },
    on_tree_node_click(data, node) {
      if (node.level === 1) {
        this.uiSelectDatabaseData = data
      } else if (node.level === 2) {
        this.uiSelectSubTable = null
        this.uiIsSuperTable = true
        this.uiSelectSuperTable = data
        // Database
        this.uiSelectDatabaseData = node.parent && node.parent.data
      } else if (node.level === 3) {
        this.uiSelectSubTable = data
        this.uiIsSuperTable = false
        this.uiSelectSuperTable = node.parent && node.parent.data
        // Database
        this.uiSelectDatabaseData = node.parent && node.parent.parent && node.parent.parent.data
      }
    },
    init_tree_data() {
      this.uiLoadingTree = true
      this.$store.dispatch('taos_tree/show_databases', this.connect_info).then(res => {
        if (res.status) {
          this.rawDatabaseData = res.data
        }
        this.uiLoadingTree = false
      })
    },
    show_sub_tables(stable_name) {
      return this.$store.dispatch('taos_tree/show_sub_tables', [this.connect_info, stable_name]).then(res => {
        if (res.status) {
          if (res.data && res.count > 0) {
            this.change_sub_table_data(res.data)
            return this.fetch_super_tables(res.data)
          }
        }
        return []
      })
    }
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
.panelWrapper {
  height: 100%;

  .sideWrapper {
    font-size: 12px;

    .iconWrapper2 {
      display: inline;
      position: absolute;
      right: 14px;
      height: 100%;
    }
  }

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