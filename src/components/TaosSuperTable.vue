<template>
  <el-container class="panelWrapper">
    <el-aside class="mainAside" width="251px" v-loading="loadingSuperList">
      <!-- 超级表列表 -->
      <el-table size="mini" highlight-current-row @current-change="handleClickSuperT" :data="superTables"
        style="width: 100%">
        <el-table-column label="超级表名" width="250">
          <template slot="header" slot-scope="scope">
            <span>超级表名</span>
            <div class="iconWrapper">
              <div class="iconWrapper_" @click.stop="SuperTdialog = true">
                <img class="icon1" v-if="searchIcon" @mouseenter="searchIcon = false" src="@/assets/img/search_.png">
                <img class="icon1" v-else src="@/assets/img/search.png" @mouseleave="searchIcon = true">
              </div>
              <div class="iconWrapper_" @click="freshSuperTList">
                <img class="icon1" v-if="freshIcon" @mouseenter="freshIcon = false" src="@/assets/img/fresh_.png">
                <img class="icon1" v-else src="@/assets/img/fresh.png" @mouseleave="freshIcon = true">
              </div>
            </div>
          </template>
          <template slot-scope="scope">
            <img class="icon1" src="@/assets/img/file.png">
            <span class="superTables">{{ scope.row.name }}</span>
            <div class="iconWrapper2">
              <!-- <img class="icon1" @click="editSuperT(scope.row.name)" src="@/assets/img/edit.png"> -->
              <img class="icon1" @click.stop="deleteSuperT(scope.row.name)" src="@/assets/img/delete.png">
            </div>
          </template>

        </el-table-column>
      </el-table>
    </el-aside>
    <el-main v-loading="loadingSuperTable">
      <!-- 超级表筛选 -->
      <el-dialog :close-on-click-modal="false" :before-close="concelSuperTableFilter" title="筛选条件"
        :visible.sync="superTableFilterDialog">
        <el-form :model="superTableFilter" label-width="80px">
          <el-form-item label="数据项">
            <el-checkbox-group v-model="superTableFilter.fields">
              <el-row class="btnGroup">
                <el-button-group>
                  <el-button size="mini" @click="STChooseAll">全选</el-button>
                  <el-button size="mini" @click="STChooseReverse">反选</el-button>
                </el-button-group>
              </el-row>
              <el-row class="checkboxGroup">
                <el-col v-for="label in this.superTableLabelItems" :key="label" :span="8">
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
          <el-switch class="switchStyle" v-model="superTorder" active-value="ASC" inactive-value="DESC"
            active-text="时间正序" inactive-text="时间倒序">
          </el-switch>

        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="concelSuperTableFilter" size="small">取消</el-button>
          <el-button @click="postSuperTableFilter" size="small">设置</el-button>
        </span>
      </el-dialog>
      <!-- 超级表数据 -->
      <el-row class="superTSearchRow">
        <el-col :span="3" class="dataPackerLabel">时间范围: </el-col>
        <el-col :span="13">
          <!-- <el-form  :model="superTableFilter" label-width="80px"> -->
          <!-- <el-form-item label="时间范围" > -->
          <div class="datePickerWrapper">
            <el-date-picker @change="selectSuperData(false, true)" style="width: 100%;" size="small"
              v-model="superTableFilter.superDateRange" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
            </el-date-picker>
          </div>
          <!-- </el-form-item> -->
          <!-- </el-form> -->
          <!-- <el-input v-model="superTableFilter.superTSearchText" class="input-with-select" size="small">
              <el-select v-model="superTableFilter.superTSearchColumn" slot="prepend" placeholder="请选择">
                <el-option v-for="(label, index) in this.superTableLabelItems" :label="label" :value="label" :key="index"></el-option>
              </el-select>
              <el-button @click="searchSuperText" slot="append" icon="el-icon-search" size="small" class="superTSearchBtn"></el-button>
            </el-input> -->
        </el-col>
        <el-col :span="4" class="freshDataBtn">
          <el-button @click="openSuperTableFilterD" size="small" style="width: 100%" icon="el-icon-setting">
            筛选条件</el-button>
        </el-col>
        <el-col :span="4" class="freshDataBtn">
          <el-button @click="selectSuperData(false, false)" size="small" style="width: 100%" icon="el-icon-refresh">数据刷新
          </el-button>
        </el-col>
      </el-row>
      <!-- 超级表分页 -->
      <div class="paginationWrapper">
        <el-pagination :hide-on-single-page="true" :current-page.sync="currentPageTable" background
          @current-change="paginationSuperChange" :page-size="eachPageTable" layout="prev, pager, next"
          :total="totalSuperTable">
        </el-pagination>
      </div>
      <div class="tableWrapper">
        <el-table size="mini" :data="superTableData" border stripe :max-height="tableHeight" style="width: 100%">
          <el-table-column fixed v-if="superTableLabel[0]" :prop="superTableLabel[0]" :label="superTableLabel[0]"
            width="250">
          </el-table-column>
          <el-table-column v-for="(data, index) in superTableLabel.slice(1)" :key="index" :prop="data" :label="data"
            width="180">
          </el-table-column>
        </el-table>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
  name: 'TaosSuperTable',
  props: {
    msg: String
  },
  computed: {
    ...mapState({
      loadingSuperList: state => state.taos.loadingSuperList,
      loadingSuperTable: state => state.taos.loadingSuperTable,
      superTables: state => state.taos.superTables,
      superTableData: state => state.taos.superTableData,
      superTableLabel: state => state.taos.superTableLabel,
      superTableLabelItems: state => state.taos.superTableLabelItems,
      totalSuperTable: state => state.taos.totalSuperTable,
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
      superTableFilter: {             // L41
        fields: [],
        superDateRange: [],
        superTSearchText: "",
        superTSearchColumn: "",
      },
      superTableFilterDialog: false, // L59
      eachPageTable: 20, // L79
      currentPageTable: 1, // L80
      searchIcon: true, // L94
      freshIcon: true, // L95
      superTorder: "ASC", // L105
      tableHeight: '100%',
    }
  },
  methods: {
    // L431
    freshSuperTList() {
      // this.$store.dispatch('taos/clear_super_table')
      this.freshSuperTables()
    },
    // L499
    freshSuperTables() {
      this.$store.dispatch('taos/clear_super_table')
      this.$store.dispatch('taos/show_super_tables', {
        "connect_info": {
          host: this.theLink.host,
          port: this.theLink.port,
          user: this.theLink.user,
          password: this.theLink.password
        },
        "db": this.theDB
      }) // showSuperTables()
    },
    // L581
    openSuperTableFilterD() {
      this.superTableFilterDialog = true
      this.superTableFilterCopy = JSON.parse(JSON.stringify(this.superTableFilter))
    },
    // L585
    concelSuperTableFilter() {
      this.$message({
        message: '取消操作',
        type: 'warning',
        duration: 1000
      });
      this.superTableFilterDialog = false
      this.superTableFilter = this.superTableFilterCopy
    },
    // L597
    postSuperTableFilter() {
      this.superTableFilterDialog = false
      this.selectSuperData(false)
    },
    // L568
    selectSuperData(isFirst, isResetPage = false) {
      //处理时间范围
      let start_time = null
      let end_time = null
      if (this.superTableFilter.superDateRange) {
        start_time = this.superTableFilter.superDateRange[0];
        end_time = this.superTableFilter.superDateRange[1];
      }

      //是否需要重置分页
      if (isResetPage) {
        this.currentPageTable = 1
      }

      let offsetVal = (this.currentPageTable - 1) * this.eachPageTable

      //处理查询数据
      // if(!this.superTableFilter.superTSearchText.trim()){
      //   this.superWhere = ""
      // }

      this.$store.dispatch('taos/select_super_table_data', {
        "connect_info": {
          host: this.theLink.host,
          port: this.theLink.port,
          user: this.theLink.user,
          password: this.theLink.password
        },
        "limit": this.eachPageTable,
        "offset": offsetVal,
        "order": this.superTorder,
        "start_time": start_time,
        "end_time": end_time,
        "is_first": isFirst,
      }) // selectData()
    },
    // L792
    handleClickSuperT(val) {
      if (val) {
        this.$store.dispatch('taos/clear_super_table', false)
        // this.superTableName <-- val.name
        this.$store.dispatch('taos/change_super_table_name', val.name)
        this.selectSuperData(true)
      }
    },
    // L806
    paginationSuperChange() {
      this.selectSuperData(false)
    },
    // L815
    deleteSuperT(val) {
      this.$confirm('确认删除超级表\`' + val + "\`吗？")
      .then(_ => {
        this.$store.dispatch('taos/drop_super_table', {
          "connect_info": {
            host: this.theLink.host,
            port: this.theLink.port,
            user: this.theLink.user,
            password: this.theLink.password
          },
          "db": this.theDB,
          "table_name": val,
          "cb": () => this.freshSuperTables()
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
      this.superTableFilter.fields = this.superTableLabelItems
    },
    // L941
    STChooseReverse() {
      let newFields = this.superTableLabelItems.filter((item) => {
        return this.superTableFilter ? this.superTableFilter.fields.indexOf(item) == -1 : false;
      })
      this.superTableFilter.fields = newFields
    },
  },
  mounted() {
    this.emitter.on("setSelectSuperTableDataResponse", (res) => {
      console.log("[ConnList] setSelectSuperTableDataResponse: ", res)
      if (res != undefined && res != null) {
        if (res.status) {
          //成功
          if (res.count > 0) {
            // 拉取超级表成功
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
    this.emitter.on("setDropSuperTableResponse", (res) => {
      console.log("[ConnList] setDropSuperTableResponse: ", res)
      if (res != undefined && res != null) {
        if (res.status) {
          // 删除表成功
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1000
          });
        } else if(res.msg) {
          //删除失败
          this.$message({
            message: res.msg,
            type: 'error',
            duration: 3000
          });
        }
      }
    });
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

  .mainAside {
    .iconWrapper {
      display: inline;
      margin-left: 50px;

      .iconWrapper_ {
        display: inline;
      }
    }

    .superTables {
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

  .superTSearchRow {
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
