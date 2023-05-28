<template>
  <div class="app-container">
    <div class="filter-container">
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
      <el-table-column label="帮扶编号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属班级" align="center">
        <template slot-scope="{row}">
          <span>{{ getClassName(row.classId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="帮扶对象" align="center">
        <template slot-scope="{row}">
          <span>{{ getStudentName(row.studentId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="帮扶教师" align="center">
        <template slot-scope="{row}">
          <span>{{ getUserName(row.teacherId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="帮扶内容" align="center">
        <template slot-scope="{row}">
          <span>{{ row.helpDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="所属班级" prop="classId">
          <el-select ref="select" v-model="temp.classId" :disabled="dialogStatus==='create' ? false : true" placeholder="请选择">
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="帮扶对象" prop="studentId">
          <el-select ref="select" v-model="temp.studentId" :disabled="dialogStatus==='create' ? false : true" placeholder="请选择">
            <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="帮扶内容" prop="helpDesc">
          <el-input v-model="temp.helpDesc" type="textarea" />
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
        <el-button type="primary" @click="dialogPvVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { addHelpInfo, delHelpInfo, getHelpInfo, updateHelpInfo } from '@/api/helping' // secondary package based on el-pagination
import { getToken } from '@/utils/auth'
import { fetchList } from '@/api/article'
import { getClassList } from '@/api/student'
import { getStudentinfo } from '@/api/student'

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
        studentId: undefined,
        classId: undefined,
        teacherId: undefined,
        helpDesc: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑记录',
        create: '添加记录'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      classOptions: [],
      studentOptions: [],
      usersOptions: []
    }
  },
  created() {
    this.getClassList()
    this.getStudentList()
    this.getUserList()
    this.getList()
  },
  methods: {
    getStudentName(row) {
      let sName = '-'
      this.studentOptions.map((c) => {
        c.value === row && (sName = c.label)
      })
      return sName
    },
    getClassName(row) {
      let className = '-'
      this.classOptions.map((c) => {
        c.value === row && (className = c.label)
      })
      return className
    },
    getUserName(row) {
      let userName = '-'
      this.usersOptions.map((c) => {
        c.value === row && (userName = c.label)
      })
      return userName
    },
    getClassList() {
      getClassList().then(response => {
        if (response.code === 200) {
          const labal = []
          response.data.forEach((item, index) => {
            var labaldata = {
              'value': item.id,
              'label': item.classname
            }
            labal.push(labaldata)
          })
          this.classOptions = labal
        }
      })
    },
    getStudentList() {
      var params = {
        pageon: false
      }
      getStudentinfo(params).then(response => {
        if (response.code === 200) {
          const labal = []
          response.data.forEach((item, index) => {
            var labaldata = {
              'value': item.id,
              'label': item.studentName
            }
            labal.push(labaldata)
          })
          this.studentOptions = labal
        }
      })
    },
    getUserList() {
      var param = {
        pageon: false
      }
      fetchList(param).then(response => {
        if (response.code === 200) {
          const labal = []
          response.data.forEach((item, index) => {
            var labaldata = {
              'value': item.id,
              'label': item.realname
            }
            labal.push(labaldata)
          })
          this.usersOptions = labal
        }
      })
    },
    getList() {
      this.listLoading = true
      getHelpInfo(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
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
        studentId: undefined,
        classId: undefined,
        teacherId: undefined,
        helpDesc: undefined
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
          this.temp.teacherId = getToken()
          addHelpInfo(this.temp).then(response => {
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
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateHelpInfo(this.temp).then(response => {
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
      this.$confirm('确定要删除该记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          delHelpInfo(row.id).then(response => {
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
    handleDownload() {
      this.downloadLoading = true
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
