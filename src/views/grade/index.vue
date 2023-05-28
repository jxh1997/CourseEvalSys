<template>
  <div class="app-container">
    <div class="filter-container" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          添加
        </el-button>
      </div>
      <div>
        <el-button :style="{background:'#1890ff',borderColor:'#1890ff'}" icon="el-icon-upload" size="mini" type="primary" @click=" dialogVisible=true">成绩单上传</el-button>
        <el-button :style="{background:'#1890ff',borderColor:'#1890ff'}" icon="el-icon-upload" size="mini" type="primary" @click=" dialogVisible1=true">课程自评上传</el-button>
      </div>
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
      <el-table-column label="成绩编号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="课程名称" align="center">
        <template slot-scope="{row}">
          <span>{{ getCourseName(row.courseId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学生姓名" align="center">
        <template slot-scope="{row}">
          <span>{{ getStudentName(row.studentId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成绩" align="center">
        <template slot-scope="{row}">
          <span>{{ row.repVal }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成绩类型" align="center">
        <template slot-scope="{row}">
          <span>{{ getGradeName(row.repType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button size="mini" @click="getGradeInfo(row)">
            成绩详情
          </el-button>
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
        <el-form-item label="课程名称" prop="courseId">
          <el-select ref="select" v-model="temp.courseId" :disabled="dialogStatus==='create' ? false : true" placeholder="请选择课程">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="学生姓名" prop="studentId">
          <el-select ref="select" v-model="temp.studentId" :disabled="dialogStatus==='create' ? false : true" placeholder="请选择学生">
            <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="成绩" prop="repVal">
          <el-input v-model="temp.repVal" />
        </el-form-item>
        <el-form-item label="成绩类型" prop="repType">
          <el-select ref="select" v-model="temp.repType" :disabled="dialogStatus==='create' ? false : true" placeholder="请选择成绩类型">
            <el-option v-for="item in gradeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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

    <el-dialog :visible.sync="dialogPvVisible" title="成绩详情">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="type" label="成绩类型" />
        <el-table-column prop="weight" label="成绩占比" />
        <el-table-column prop="score" label="得分" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">取消</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible">
      <el-upload
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        class="editor-slide-upload"
        action="/api/courseevalsys/common/receiptReport"
      >
        <el-button size="small" type="primary">
          点击上传成绩单
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">
        关闭
      </el-button>
      <!-- <el-button type="primary" @click="handleSubmit">
        确认
      </el-button> -->
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible1">
      <el-upload
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove1"
        :on-success="handleSuccess1"
        :before-upload="beforeUpload1"
        class="editor-slide-upload"
        action="/api/courseevalsys/common/importCourseReport"
      >
        <el-button size="small" type="primary">
          点击上传课程自评文件
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible1 = false">
        关闭
      </el-button>
      <!-- <el-button type="primary" @click="handleSubmit">
        确认
      </el-button> -->
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { getCourseHeaders } from '@/api/course'
import { getStudentinfo } from '@/api/student'
import { addReportInfo, delReportInfo, getReportInfo, updateReportInfo, getGradeInfo } from '@/api/grade' // secondary package based on el-pagination
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
        courseId: undefined,
        studentId: undefined,
        repVal: undefined,
        repType: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑成绩',
        create: '添加成绩'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      dialogVisible: false,
      dialogVisible1: false,
      listObj: {},
      fileList: [],
      courseOptions: [],
      studentOptions: [],
      gradeOptions: [{
        value: 1,
        label: '小测验'
      }, {
        value: 2,
        label: '期末考试'
      }, {
        value: 3,
        label: '作业'
      }, {
        value: 4,
        label: '大作业'
      }, {
        value: 5,
        label: '平时考核'
      }, {
        value: 6,
        label: '课程自评'
      }]

    }
  },
  created() {
    this.getCourseList()
    this.getStudentList()
    this.getList()
  },
  methods: {
    getGradeInfo(row) {
      this.dialogPvVisible = true
      this.pvData = []
      var params = {
        courseId: row.courseId,
        studentId: row.studentId
      }
      getGradeInfo(params).then(response => {
        if (response.code === 200) {
          this.pvData.push({
            type: '期末成绩',
            weight: response.data.endweight,
            score: response.data.endVal
          }, {
            type: '平时成绩',
            weight: response.data.normalweight,
            score: response.data.normalVal
          }, {
            type: '最终成绩',
            weight: '-',
            score: response.data.finalVal
          })
        }
      })
    },
    getCourseName(row) {
      let cName = '-'
      this.courseOptions.map((c) => {
        c.value === row && (cName = c.label)
      })
      return cName
    },
    getStudentName(row) {
      let sName = '-'
      this.studentOptions.map((c) => {
        c.value === row && (sName = c.label)
      })
      return sName
    },
    getGradeName(row) {
      let gName = '-'
      this.gradeOptions.map((c) => {
        c.value === row && (gName = c.label)
      })
      return gName
    },
    getCourseList() {
      var params = {
        pageon: false
      }
      getCourseHeaders(params).then(response => {
        if (response.code === 200) {
          const labal = []
          response.data.forEach((item, index) => {
            var labaldata = {
              'value': item.id,
              'label': item.courseName
            }
            labal.push(labaldata)
          })
          this.courseOptions = labal
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
    // upload
    checkAllSuccess() {
      return Object.keys(this.listObj).every(item => this.listObj[item].hasSuccess)
    },
    handleSubmit() {
      const arr = Object.keys(this.listObj).map(v => this.listObj[v])
      // if (!this.checkAllSuccess()) {
      //   this.$message('Please wait for all images to be uploaded successfully. If there is a network problem, please refresh the page and upload again!')
      //   return
      // }
      this.$emit('successCBK', arr)
      this.listObj = {}
      this.fileList = []
      this.dialogVisible = false
      this.dialogVisible1 = false
    },
    handleSuccess(response, file) {
      if (response.code !== 200) {
        this.$notify({
          title: 'Fail',
          dangerouslyUseHTMLString: true,
          message: response.msg,
          type: 'error'
        })
      } else {
        this.$notify({
          title: 'Success',
          dangerouslyUseHTMLString: true,
          message: `成绩单上传成功`,
          type: 'success'
        })
        this.getList(this.listQuery)
      }
    },
    handleSuccess1(response, file) {
      if (response.code !== 200) {
        this.$notify({
          title: 'Fail',
          dangerouslyUseHTMLString: true,
          message: response.msg,
          type: 'error'
        })
      } else {
        this.$notify({
          title: 'Success',
          dangerouslyUseHTMLString: true,
          message: `课程自评文件上传成功`,
          type: 'success'
        })
        this.getList(this.listQuery)
      }
    },
    handleRemove(file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          delete this.listObj[objKeyArr[i]]
          return
        }
      }
    },
    handleRemove1(file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          delete this.listObj[objKeyArr[i]]
          return
        }
      }
    },
    beforeUpload(file) {
      const _self = this
      const _URL = window.URL || window.webkitURL
      const fileName = file.uid
      this.listObj[fileName] = {}
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = _URL.createObjectURL(file)
        img.onload = function() {
          _self.listObj[fileName] = { hasSuccess: false, uid: file.uid, width: this.width, height: this.height }
        }
        resolve(true)
      })
    },
    beforeUpload1(file) {
      const _self = this
      const _URL = window.URL || window.webkitURL
      const fileName = file.uid
      this.listObj[fileName] = {}
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = _URL.createObjectURL(file)
        img.onload = function() {
          _self.listObj[fileName] = { hasSuccess: false, uid: file.uid, width: this.width, height: this.height }
        }
        resolve(true)
      })
    },
    getList() {
      this.listLoading = true
      getReportInfo(this.listQuery).then(response => {
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
        courseId: undefined,
        studentId: undefined,
        repVal: undefined,
        repType: undefined
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
          addReportInfo(this.temp).then(response => {
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
          updateReportInfo(this.temp).then(response => {
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
      this.$confirm('确定要删除该成绩?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          delReportInfo(row.id).then(response => {
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

<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  ::v-deep .el-upload--picture-card {
    width: 100%;
  }
}
</style>
