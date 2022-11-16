<template>
  <el-container class="tableWrapper">
    <el-aside class="mainAside" width="200px">
      <div v-loading="loadingTableList">
        <!-- 表列表 -->
        <el-table size="mini" :data="tables" highlight-current-row @current-change="handleClickT" style="width: 100%">
          <el-table-column label="表名" width="180">
            <template slot="header" slot-scope="scope">
              <span>表名</span>
              <div class="iconWrapper">
                <div class="iconWrapper_ " @click="Tdialog = true">
                  <img class="icon1" v-if="searchIcon" @mouseenter="searchIcon = false" src="@/assets/img/search_.png">
                  <img class="icon1" v-else src="@/assets/img/search.png" @mouseleave="searchIcon = true">
                </div>
                <div class="iconWrapper_" @click="freshTList">
                  <img class="icon1" v-if="freshIcon" @mouseenter="freshIcon = false" src="@/assets/img/fresh_.png">
                  <img class="icon1" v-else src="@/assets/img/fresh.png" @mouseleave="freshIcon = true">
                </div>
              </div>
            </template>
            <template slot-scope="scope">
              <img class="icon1" src="@/assets/img/file.png">
              <span class="surperTables">{{ scope.row.table_name }}</span>
              <div class="iconWrapper2">
                <!-- <img class="icon1" @click="editT" src="@/assets/img/edit.png"> -->
                <img class="icon1" @click.stop="deleteT(scope.row.table_name)" src="@/assets/img/delete.png">
              </div>
            </template>

          </el-table-column>
        </el-table>
        <el-dialog title="搜索表" :visible.sync="Tdialog" width="30%" :before-close="closeTdialog">
          <el-input v-model="TdialogText">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="closeTdialog">取 消</el-button>
            <el-button size="small" type="primary" @click="searchTList">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-aside>
    <el-main>
      <div v-loading="loadingTable">
        <el-dialog :close-on-click-modal="false" :before-close="concelTableFilter" title="筛选条件"
          :visible.sync="tableFilterDialog">
          <el-form :model="tableFilter" label-width="80px">
            <el-form-item label="数据项">
              <el-checkbox-group v-model="tableFilter.fields">
                <el-row class="btnGroup">
                  <el-button-group>
                    <el-button size="mini" @click="TChooseAll">全选</el-button>
                    <el-button size="mini" @click="TChooseReverse">反选</el-button>
                  </el-button-group>
                </el-row>
                <el-row class="checkboxGroup">
                  <el-col v-for="label in this.tableLabelItems" :key="label" :span="8">
                    <el-checkbox class="checkbox" :label="label">{{ label }}</el-checkbox>
                  </el-col>
                </el-row>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="每页数目">

              <el-radio-group v-model="eachPageTable">
                <el-row class="checkboxGroup2">
                  <el-radio :label="10">10</el-radio>
                  <el-radio :label="15">15</el-radio>
                  <el-radio :label="20">20</el-radio>
                </el-row>
              </el-radio-group>
            </el-form-item>
            <el-switch class="switchStyle" v-model="Torder" active-value="ASC" inactive-value="DESC" active-text="时间倒序"
              inactive-text="时间正序">
            </el-switch>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="concelTableFilter" size="small">取消</el-button>
            <el-button @click="postTableFilter" size="small">设置</el-button>
          </span>
        </el-dialog>
        <!-- 表数据 -->
        <el-row class="surperTSearchRow">

          <el-col :span="3" class="dataPackerLabel">时间范围: </el-col>
          <el-col :span="13">
            <div class="datePickerWrapper">
              <el-date-picker @change="selectTData(false, true)" style="width: 100%;" size="small"
                v-model="tableFilter.dateRange" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange"
                range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
              </el-date-picker>
            </div>
          </el-col>
          <!-- <el-col :span="15">
            <el-input v-model="tableFilter.tableSearchText" class="input-with-select" size="small">
              <el-select v-model="tableFilter.tableSearchColumn" slot="prepend" placeholder="请选择">
                <el-option v-for="(label, index) in this.tableLabelItems" :label="label" :value="label" :key="index"></el-option>
              </el-select>
              <el-button @click="searchTableText" slot="append" icon="el-icon-search" size="small" class="surperTSearchBtn"></el-button>
            </el-input>
          </el-col> -->
          <el-col :span="4" class="freshDataBtn">
            <el-button @click="openTableFilterD" size="small" style="width: 100%" icon="el-icon-setting">筛选条件
            </el-button>
          </el-col>
          <el-col :span="4" class="freshDataBtn">
            <el-button @click="selectTData(false, false)" size="small" style="width: 100%" icon="el-icon-refresh">数据刷新
            </el-button>
          </el-col>
        </el-row>
        <el-table size="mini" :data="tableData" border max-height="585" style="width: 100%;">
          <el-table-column fixed v-if="tableLabel[0]" :prop="tableLabel[0]" :label="tableLabel[0]" width="250">
          </el-table-column>
          <el-table-column v-for="(data, index) in tableLabel.slice(1)" :key="index" :prop="data" :label="data">
          </el-table-column>
        </el-table>
        <!-- 表分页 -->
        <div class="paginationWrapper">
          <el-pagination @current-change="paginationChange" :hide-on-single-page="true"
            :current-page.sync="currentPageTable" :page-size="eachPageTable" layout="prev, pager, next"
            :total="totalTable">
          </el-pagination>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: "TaosTables",
  computed: {
    ...mapState({
      loadingTableList: state => state.taos.loadingTableList,
      loadingTable: state => state.taos.loadingTable,
      tables: state => state.taos.tables,
      tableData: state => state.taos.tableData,
      tableLabel: state => state.taos.tableLabel,
      tableLabelItems: state => state.taos.tableLabelItems,
      totalTable: state => state.taos.totalTable,
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
      tableFilter: { // L49
        fields: [],
        dateRange: [],
        tableSearchText: "",
        tableSearchColumn: "",
      },
      tableFilterDialog: false, // L58
      eachPageTable: 10, // L81
      currentPageTable: 1, // L82
      searchIcon: true, // L94
      freshIcon: true, // L95
      Tdialog: false, // L102
      TdialogText: "", // L103
      Torder: "ASC", // L106
    }
  },
  methods: {
    checkout(products) {
      this.$store.dispatch('cart/checkout', products)
    },
    // L436
    searchTList() {
      this.Tdialog = false
      this.tables = []
      this.clearTable()

      let payload = {
        host: this.theLink.host,
        port: this.theLink.port,
        user: this.theLink.user,
        password: this.theLink.password
      }
      this.loadingTableList = true
      TaosRestful.showTables(this.theDB, payload, like = this.TdialogText).then(data => {
        if (data.res) {
          //拉取表成功
          this.$message({
            message: '查找成功',
            type: 'success',
            duration: 1000
          });
          this.tables = data.data
        } else {
          this.$message({
            message: data.msg,
            type: 'error',
            duration: 1000
          });
          this.freshTables()

        }
        this.TdialogText = ""
        this.loadingTableList = false
      })
    },
    // L470
    freshTList() {
      // this.tables = []
      // this.clearTable()
      this.freshTables()
    },
    // L531
    freshTables() {
      //清理表列表
      //清理选中的表和具体数据
      this.$store.dispatch('taos/clear_table')
      this.$store.dispatch('taos/show_tables', {
        "connect_info": {
          host: this.theLink.host,
          port: this.theLink.port,
          user: this.theLink.user,
          password: this.theLink.password
        },
        "db": this.theDB
      }) // showTables()
    },
    // L598
    openTableFilterD() {
      this.tableFilterDialog = true
      this.tableFilterCopy = JSON.parse(JSON.stringify(this.tableFilter))
    },
    // L602
    concelTableFilter() {
      this.$message({
        message: '取消操作',
        type: 'warning',
        duration: 1000
      });
      this.tableFilterDialog = false
      this.tableFilter = this.tableFilterCopy
    },
    // L611
    postTableFilter() {
      this.tableFilterDialog = false
      this.selectTData(false)
    },
    // L728
    selectTData(isFirst, isResetPage = false) {
      //处理时间范围
      let start_time = null
      let end_time = null
      if (this.tableFilter.dateRange) {
        start_time = this.tableFilter.dateRange[0];
        end_time = this.tableFilter.dateRange[1];
      }

      if (isResetPage) {
        this.currentPageTable = 1
      }

      let offsetVal = (this.currentPageTable - 1) * this.eachPageTable

      // if(!this.tableFilter.tableSearchText.trim()){
      //   this.tableWhere = ""
      // }

      this.$store.dispatch('taos/select_table_data', {
        "connect_info": {
          host: this.theLink.host,
          port: this.theLink.port,
          user: this.theLink.user,
          password: this.theLink.password
        },
        "limit": this.eachPageTable,
        "offset": offsetVal,
        "order": this.Torder,
        "start_time": start_time,
        "end_time": end_time,
        "is_first": isFirst,
      }) // selectData()
    },
    // L799
    handleClickT(val) {
      if (val) {
        this.$store.dispatch('taos/clear_table', false)
        // this.tableName <-- val.table_name
        this.$store.dispatch('taos/change_table_name', val.table_name)
        this.selectTData(true)
      }
    },
    // L809
    paginationChange() {
      this.selectTData(false)
    },
    // L934
    closeTdialog() {
      this.TdialogText = ""
      this.Tdialog = false
    },
    // L947
    TChooseAll() {
      this.tableFilter.fields = this.tableLabelItems
    },
    // L950
    TChooseReverse() {
      let newFields = this.tableLabelItems.filter((item) => {
        return this.tableLabelItems.fields ? this.tableLabelItems.fields.indexOf(item) == -1 : false;
      })
      this.tableFilter.fields = newFields
    }
  },
  mounted() {
    this.emitter.on("setShowTableResponse", (res) => {
      console.log("[ConnList] setShowTableResponse: ", res)
      if (res != undefined && res != null) {
        if (res.status) {
          //
        } else {
          //连接失败
          this.$message({
            message: res.msg,
            type: 'error',
            duration: 3000
          });
        }
      }
    });
    this.emitter.on("setSelectTableDataResponse", (res) => {
      console.log("[ConnList] setSelectTableDataResponse: ", res)
      if (res != undefined && res != null) {
        if (res.status) {
          //成功
          if (res.count > 0) {
            // 拉取表成功
            this.$message({
              message: '获取成功',
              type: 'success',
              duration: 1000
            });
          } else {
            this.$message({
              message: '无数据',
              type: 'warning',
              duration: 3000
            });
          }
        } else {
          // 拉取失败
          this.$message({
            message: res.msg,
            type: 'error',
            duration: 3000
          });
        }
      }
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.tableWrapper {
  height: 100%;

  .mainAside {
    .iconWrapper {
      display: inline;
      margin-left: 50px;

      .iconWrapper_ {
        display: inline;
      }
    }

    .surperTables {
      margin-left: 10px;
      cursor: pointer;
    }

    .iconWrapper2 {
      display: inline;
      position: absolute;
      right: 14px;
      height: 100%;
    }
  }

  .btnGroup {
    margin: 6px 0 0 10px;
  }

  .checkboxGroup {
    margin: 10px 0 0 10px;
  }

  .checkboxGroup2 {
    margin: 12px 0 0 10px;
  }

  .switchStyle {
    margin-left: 12px;
    position: relative;
    bottom: 3px;
  }

  .surperTSearchRow {
    margin: 20px 0 20px 0;

    .dataPackerLabel {
      line-height: 34px;
      font-size: 14px;
      color: #606266;
    }

    .freshDataBtn {
      padding-left: 20px;
    }

    .paginationWrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>