<template>
  <el-table :data="info" size="mini" border style="width: 100%">
    <el-table-column prop="name" label="列名" width="180">
    </el-table-column>
    <el-table-column prop="value" label="数据" width="240">
    </el-table-column>
    <el-table-column prop="description" label="说明">
    </el-table-column>
  </el-table>
</template>

<script>
import taos_mixin from '../../mixins/taos'

export default {
  name: "TaosProperties",
  mixins: [taos_mixin],
  props: {
    db: Object
  },
  data: function () {
    return {
      reserved: []
    }
  },
  computed: {
    info: function () {
      return this.make_db_info(this.db)
    }
  },
  methods: {
    checkout (products) {
      this.$store.dispatch('cart/checkout', products)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
</style>