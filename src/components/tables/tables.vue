<template>
  <div class="panelWrapper" v-loading="uiLoadingTable">
    <!-- 超级表筛选 -->
    <el-dialog :close-on-click-modal="false" :before-close="concelTableFilter" title="筛选条件"
      :visible.sync="tableFilterDialog">
      <el-form :model="tableFilter" label-width="80px">
        <el-form-item label="数据项">
          <el-checkbox-group v-model="tableFilter.fields" :min="1">
            <el-row class="btnGroup">
              <el-button-group>
                <el-button size="mini" @click="STChooseAll">全选</el-button>
                <el-button size="mini" @click="STChooseReverse">反选</el-button>
              </el-button-group>
            </el-row>
            <el-row class="checkboxGroup">
              <el-col v-for="label in this.tableLabelItems.slice(1)" :key="label" :span="8">
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
        <el-switch class="switchStyle" v-model="tableOrder" active-value="ASC" inactive-value="DESC"
          active-text="时间正序" inactive-text="时间倒序">
        </el-switch>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="concelTableFilter" size="small">取消</el-button>
        <el-button @click="postTableFilter" size="small">设置</el-button>
      </span>
    </el-dialog>
    <!-- 超级表数据 -->
    <el-row class="tableSearchRow">
      <el-col :span="3" class="dataPackerLabel">时间范围: </el-col>
      <el-col :span="13">
        <!-- <el-form  :model="tableFilter" label-width="80px"> -->
        <!-- <el-form-item label="时间范围" > -->
        <div class="datePickerWrapper">
          <el-date-picker @change="selectTableData(false, true)" style="width: 100%;" size="small"
            v-model="tableFilter.superDateRange" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange"
            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
          </el-date-picker>
        </div>
        <!-- </el-form-item> -->
        <!-- </el-form> -->
        <!-- <el-input v-model="tableFilter.tableSearchText" class="input-with-select" size="small">
            <el-select v-model="tableFilter.tableSearchColumn" slot="prepend" placeholder="请选择">
              <el-option v-for="(label, index) in this.tableLabelItems" :label="label" :value="label" :key="index"></el-option>
            </el-select>
            <el-button @click="searchTableText" slot="append" icon="el-icon-search" size="small" class="tableSearchBtn"></el-button>
          </el-input> -->
      </el-col>
      <el-col :span="4" class="freshDataBtn">
        <el-button @click="openTableFilterD" size="small" style="width: 100%" icon="el-icon-setting">
          筛选条件</el-button>
      </el-col>
      <el-col :span="4" class="freshDataBtn">
        <el-button @click="selectTableData(false, false)" size="small" style="width: 100%" icon="el-icon-refresh">数据刷新
        </el-button>
      </el-col>
    </el-row>
    <!-- 超级表分页 -->
    <div class="paginationWrapper">
      <el-pagination :hide-on-single-page="true" :current-page.sync="currentPageTable" background
        @current-change="paginationTableChange" :page-size="eachPageTable" layout="prev, pager, next"
        :total="totalTable">
      </el-pagination>
    </div>
    <div class="tableWrapper">
      <el-table size="mini" :data="tableData" border stripe :max-height="tableHeight" style="width: 100%">
        <el-table-column fixed v-if="tableLabel[0]" :prop="tableLabel[0]" :label="tableLabel[0]"
          width="250">
        </el-table-column>
        <el-table-column v-for="(data, index) in tableLabel.slice(1)" 
          :key="index" :prop="data" :label="data" width="180">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import taos_mixin from '../../mixins/taos'

export default {
  name: 'TaosTables',
  mixins: [taos_mixin],
  props: {
    super: Boolean,
    db: Object,
    stable: Object,
    table: Object,
  },
  computed: {
    ...mapState({
      theDB: state => state.taos_connections.theDB, // 当前数据库
      theLink: state => state.taos_connections.theLink, // 当前连接
      emitter: state => state.taos_connections.emitter
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    }),
    tableLabel: function () {
      return (this.tableData.length === 0) ? [] : [this.tableLabelItems[0], ...this.tableFilter.fields]
    }
  },
  watch: {
    db(val) {
      this.clearTable(true)
      this.selectTableData(true)
    },
    stable(val) {
      this.clearTable(true)
      this.selectTableData(true)
    },
    table(val) {
      this.selectTableData(false)
    },
    theLink(val) {
      this.connect_info = {
        host: val.host,
        port: val.port,
        user: val.user,
        password: val.password,
        // database: this.theDB,
      }
    },
  },
  data: function () {
    return {
      activeTab: "1", // L37
      tableData: [],
      tableLabelItems: [],
      totalTable: 0,
      tableFilter: {             // L41
        fields: [],
        superDateRange: [],
        tableSearchText: "",
        tableSearchColumn: "",
      },
      tableFilterDialog: false, // L59
      eachPageTable: 20, // L79
      currentPageTable: 1, // L80
      searchIcon: true, // L94
      freshIcon: true, // L95
      tableOrder: "ASC", // L105
      tableHeight: '100%',
      uiLoadingTable: false,
    }
  },
  methods: {
    // L431
    freshTableList() {
      // this.$store.dispatch('taos/clear_super_table')
      this.freshTables()
    },
    // L475
    clearTable(stable_changed = false){
      this.totalTable = 0
      this.tableData = []
      if (stable_changed) {
        this.tableFilter.fields = []
      }
    },
    // L499
    freshTables() {
      this.$store.dispatch('taos/clear_super_table')
      this.$store.dispatch('taos/show_super_tables', {
        "connect_info": this.connect_info,
        "db": this.theDB
      }) // showTables()
    },
    // L581
    openTableFilterD() {
      this.tableFilterDialog = true
      this.tableFilterCopy = JSON.parse(JSON.stringify(this.tableFilter))
    },
    // L585
    concelTableFilter() {
      this.$message({
        message: '取消操作',
        type: 'warning',
        duration: 1000
      });
      this.tableFilterDialog = false
      this.tableFilter = this.tableFilterCopy
    },
    // L597
    postTableFilter() {
      this.tableFilterDialog = false
      this.selectTableData(false)
    },
    // L568
    selectTableData(isFirst, isResetPage = false) {
      //处理时间范围
      let start_time = null
      let end_time = null
      if (this.tableFilter.superDateRange) {
        start_time = this.tableFilter.superDateRange[0];
        end_time = this.tableFilter.superDateRange[1];
      }

      //是否需要重置分页
      if (isResetPage) {
        this.currentPageTable = 1
      }

      let offsetVal = (this.currentPageTable - 1) * this.eachPageTable

      //处理查询数据
      // if(!this.tableFilter.tableSearchText.trim()){
      //   this.superWhere = ""
      // }
      if (!this.db) {
        console.warn("[TABLES] invalid database")
        return
      }
      let table_name = ""
      if (this.super && this.stable) {
        table_name = this.stable["name"]
      } else if (this.table) {
        table_name = this.table["name"]
      } else {
        console.warn("[TABLES] invalid table")
        return
      }
      this.uiLoadingTable = true
      // selectData()
      this.$store.dispatch('taos_tree/select_super_table_data', {
        "connect_info": this.connect_info,
        "db_name": this.db["name"],
        "table_name": table_name,
        "limit": this.eachPageTable,
        "offset": offsetVal,
        "order": this.tableOrder,
        "start_time": start_time,
        "end_time": end_time,
      }).then(res => {
        this.uiLoadingTable = false
        if (res.status) {
          if (res.data.length != 0) {
            if (isFirst) {
              this.tableLabelItems = Object.keys(res.data[0])
              this.tableFilter.fields = Object.keys(res.data[0]).slice(1)
            }
          }
          this.tableData = res.data
          this.totalTable = res.count
        }
      })
    },
    // L792
    handleClickTable(val) {
      if (val) {
        this.$store.dispatch('taos/clear_super_table', false)
        // this.tableName <-- val.name
        this.$store.dispatch('taos/change_super_table_name', val.name)
        this.selectTableData(true)
      }
    },
    // L806
    paginationTableChange() {
      this.selectTableData(false)
    },
    // L815
    deleteTable(val) {
      this.$confirm('确认删除超级表\`' + val + "\`吗？")
      .then(_ => {
        this.$store.dispatch('taos/drop_super_table', {
          "connect_info": this.connect_info,
          "db": this.theDB,
          "table_name": val,
          "cb": () => this.freshTables()
        }) // dropTable()
      })
      .catch(_ => {
        this.$message({
          message: '操作已取消',
          type: 'warning',
          duration:500
        });
      });
    },
    // L938
    STChooseAll() {
      this.tableFilter.fields = this.tableLabelItems.slice(1)
    },
    // L941
    STChooseReverse() {
      let newFields = this.tableLabelItems.slice(1).filter((item) => {
        return this.tableFilter ? this.tableFilter.fields.indexOf(item) == -1 : false;
      })
      this.tableFilter.fields = newFields
    },
  },
  mounted() {
    this.emitter.on("setErrorResponse", (err) => {
      this.ui_show_error_message(err)
    })
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 200;
      //后面的50：根据需求空出的高度，自行调整
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.panelWrapper {
  height: 100%;

  .checkboxGroup {
    margin: 10px 0 0 10px;
  }

  .btnGroup {
    margin: 6px 0 0 10px;
  }

  .checkboxGroup2 {
    margin: 12px 0 0 10px;
  }

  .switchStyle {
    margin-left: 12px;
    position: relative;
    bottom: 3px;
  }

  .tableSearchRow {
    margin: 0px;

    .dataPackerLabel {
      line-height: 34px;
      font-size: 14px;
      color: #606266;
    }

    .freshDataBtn {
      padding-left: 20px;
    }
  }

  .tableWrapper {
    height: calc(100% - 90px);

  }
  .paginationWrapper {
    margin: 12px 0 12px 0;
    display: flex;
    justify-content: right;
  }
}
</style>
