<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.tabName" placeholder="页面名称" style="width: 200px; margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="菜单唯一标识" prop="id" sortable="custom" align="center" width="150" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜单名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tabName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜单图标" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tabIcon }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜单url" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tabUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.tabDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="菜单名称" prop="tabName">
          <el-input v-model="temp.tabName" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="tabIcon">
          <el-input v-model="temp.tabIcon" />
        </el-form-item>
        <el-form-item label="菜单url" prop="tabUrl">
          <el-input v-model="temp.tabUrl" />
        </el-form-item>
        <el-form-item label="排序号" prop="tabDesc">
          <el-input v-model="temp.tabDesc" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getsysTab, addsysTab, delsysTab, updatesysTab } from '@/api/pagesmanager'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      classOptions: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageon: true,
        page: 1,
        limit: 20
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        tabName: undefined,
        tabIcon: undefined,
        tabUrl: undefined,
        tabDesc: undefined,
        delFlag: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑菜单',
        create: '新建菜单'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        tabName: [{ required: true, message: '此项为必填项', trigger: 'change' }],
        tabIcon: [{ required: true, message: '此项为必填项', trigger: 'change' }],
        tabUrl: [{ required: true, message: '此项为必填项', trigger: 'change' }],
        tabDesc: [{ required: true, message: '此项为必填项', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getClassName(row) {
      let className = '-'
      this.classOptions.map((c) => {
        c.value === row && (className = c.label)
      })
      return className
    },
    getList() {
      this.listLoading = true
      getsysTab(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        tabName: undefined,
        tabIcon: undefined,
        tabUrl: undefined,
        tabDesc: undefined,
        delFlag: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addsysTab(this.temp).then(response => {
            if (response.code === 200) {
              this.getList(this.listQuery)
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                dangerouslyUseHTMLString: true,
                message: `新建成功`,
                type: 'success'
              })
            } else {
              this.$notify({
                title: 'Fail',
                dangerouslyUseHTMLString: true,
                message: response.msg,
                type: 'error'
              })
            }
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updatesysTab(this.temp).then(response => {
            if (response.code === 200) {
              const index = this.list.findIndex(v => v.id === this.temp.id)
              this.list.splice(index, 1, this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                dangerouslyUseHTMLString: true,
                message: `修改成功`,
                type: 'success'
              })
            } else {
              this.$notify({
                title: 'Fail',
                dangerouslyUseHTMLString: true,
                message: response.msg,
                type: 'error'
              })
            }
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确定要删除该菜单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          delsysTab(row.id).then(response => {
            if (response.code === 200) {
              this.list.splice(index, 1)
              this.$notify({
                title: 'Success',
                dangerouslyUseHTMLString: true,
                message: `删除成功`,
                type: 'success'
              })
            } else {
              this.$notify({
                title: 'Fail',
                dangerouslyUseHTMLString: true,
                message: response.msg,
                type: 'error'
              })
            }
          })
        })
        .catch(err => { console.error(err) })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
