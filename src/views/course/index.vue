<template>
  <div class="app-container">
    <div class="filter-container" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <el-input v-model="listQuery.courseName" placeholder="请输入课程名称" style="width: 200px; margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          添加
        </el-button>
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
      <el-table-column label="课程编号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="课程名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.courseName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任课教师" align="center">
        <template slot-scope="{row}">
          <span>{{ getUserName(row.courseTeacher) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属班级" align="center">
        <template slot-scope="{row}">
          <span>{{ getClassName(row.courseClass) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属级部" align="center">
        <template slot-scope="{row}">
          <span>{{ getGradeName(row.courseGrade) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属学期" align="center">
        <template slot-scope="{row}">
          <span>{{ row.courseYear }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成绩定量分析达成度" align="center">
        <template slot-scope="{row}">
          <span>{{ row.reportValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="定性评价达成度" align="center">
        <template slot-scope="{row}">
          <span>{{ row.selfValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="综合达成度" align="center">
        <template slot-scope="{row}">
          <span>{{ row.courseReach }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleTarget(row)">
            课程目标
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="warn" size="mini" @click="calculatorReport(row)">
            计算达成度
          </el-button>
          <el-button size="mini" @click="calculatorReportInfo(row)">
            班级达成度明细
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="temp.courseName" />
        </el-form-item>
        <el-form-item label="班级" prop="courseClass">
          <el-select ref="select" v-model="temp.courseClass" :disabled="dialogStatus==='create' ? false : true" placeholder="请选择班级">
            <el-option v-for="item in classOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="级部" prop="courseGrade">
          <el-select ref="select" v-model="temp.courseGrade" :disabled="dialogStatus==='create' ? false : true" placeholder="请选择级部">
            <el-option v-for="item in gradeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属学期" prop="courseYear">
          <el-input v-model="temp.courseYear" :disabled="dialogStatus==='create' ? false : true" />
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

    <el-dialog title="课程目标" :visible.sync="dialogFormVisible1">
      <el-form ref="dataForm1" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="成绩类型" prop="courseType">
          <el-select ref="select" v-model="temp.courseType" placeholder="请选择成绩类型"  @change="handleChange">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="成绩组成" prop="coursePart">
          <el-select ref="select" v-model="temp.coursePart" placeholder="请选择课程目标">
            <el-option v-for="item in partOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="权重" prop="partWeight">
          <el-input v-model="temp.partWeight" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible1 = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateData1()">
          确定
        </el-button>
      </div>
    </el-dialog>


    <el-dialog :visible.sync="dialogPvVisible" title="班级达成度详情">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="达成度类型" />
        <el-table-column prop="pv" label="得分" />
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
        action="https://httpbin.org/post"
      >
        <el-button size="small" type="primary">
          点击上传教学大纲
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">
        取消
      </el-button>
      <el-button type="primary" @click="handleSubmit">
        确认
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'
import { addCourseHeaders, delCourseHeaders, getCourseHeaders, updateCourseHeaders, calculatorReport, calculateDetail, getCesCourseLinesById, addCesCourseLines, upCesCourseLines } from '@/api/course' // secondary package based on el-pagination
import { fetchList } from '@/api/article'
import { getClassList, getGradeList } from '@/api/student'

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
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
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
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        courseClass: undefined,
        courseGrade: undefined,
        courseName: undefined,
        courseTeacher: getToken(),
        courseYear: undefined
      },
      temp1: {
        id: undefined,
        coursePart: undefined,
        courseType: undefined,
        partWeight: undefined
      },
      dialogFormVisible: false,
      dialogFormVisible1: false,
      dialogStatus: '',
      textMap: {
        update: '编辑课程',
        create: '添加课程'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {},
      downloadLoading: false,
      dialogVisible: false,
      listObj: {},
      fileList: [],
      partOptions: [
        { value: '1', label: '小测验' },
        { value: '2', label: '期末考试' },
        { value: '3', label: '作业' },
        { value: '4', label: '大作业' },
        { value: '5', label: '平时考核' }
      ],
      typeOptions: [
        { value: '1', label: '期末成绩' },
        { value: '2', label: '达成度' },
        { value: '3', label: '平时成绩' }
      ],
      classOptions: [],
      gradeOptions: [],
      usersOptions: [],
      value: ''
    }
  },
  created() {
    this.getClassList()
    this.getGradeList()
    this.getUserList()
    this.getList()
  },
  methods: {
    calculatorReportInfo(row) {
      this.dialogPvVisible = true
      calculateDetail(row.id).then(response => {
        if (response.code === 200) {
          console.log(123, response.data)
        }
      })
    },
    getClassName(row) {
      let className = '-'
      this.classOptions.map((c) => {
        c.value === row && (className = c.label)
      })
      return className
    },
    getGradeName(row) {
      let gradeName = '-'
      this.gradeOptions.map((c) => {
        c.value === row && (gradeName = c.label)
      })
      return gradeName
    },

    getUserName(row) {
      let userName = '-'
      this.usersOptions.map((c) => {
        c.value === row && (userName = c.label)
      })
      return userName
    },

    // 用户列表
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

    // 班级列表
    async getClassList() {
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
    // 级部列表
    async getGradeList() {
      getGradeList().then(response => {
        if (response.code === 200) {
          const labal = []
          response.data.forEach((item, index) => {
            var labaldata = {
              'value': item.id,
              'label': item.gradename
            }
            labal.push(labaldata)
          })
          this.gradeOptions = labal
        }
      })
    },
    // upload
    checkAllSuccess() {
      return Object.keys(this.listObj).every(item => this.listObj[item].hasSuccess)
    },
    handleSubmit() {
      const arr = Object.keys(this.listObj).map(v => this.listObj[v])
      if (!this.checkAllSuccess()) {
        this.$message('Please wait for all images to be uploaded successfully. If there is a network problem, please refresh the page and upload again!')
        return
      }
      this.$emit('successCBK', arr)
      this.listObj = {}
      this.fileList = []
      this.dialogVisible = false
    },
    handleSuccess(response, file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = response.files.file
          this.listObj[objKeyArr[i]].hasSuccess = true
          return
        }
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

    getList() {
      this.listLoading = true
      getCourseHeaders(this.listQuery).then(response => {
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
        courseClass: undefined,
        courseGrade: undefined,
        courseName: undefined,
        courseTeacher: undefined,
        courseYear: undefined
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
          this.temp.courseTeacher = getToken()
          addCourseHeaders(this.temp).then(response => {
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
    calculatorReport(row) {
      calculatorReport(row.id).then(response => {
        if (response.code === 200) {
          this.getList(this.listQuery)
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            dangerouslyUseHTMLString: true,
            message: `计算成功`,
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
    },
    handleTarget(row) {
      this.temp1 = Object.assign({}, row) // copy obj
      this.temp1.timestamp = new Date(this.temp.timestamp)
      this.dialogFormVisible1 = true
      this.$nextTick(() => {
        this.$refs['dataForm1'].clearValidate()
      })
      this.getData1(row.id)
    },

    getData1(id) {
      var param = {
        'id': id
      }
      getCesCourseLinesById(param).then(response => {
        if (response.code === 200) {
          this.temp = Object.assign({}, {
            id: id,
            coursePart: response.data.coursePart.toString(),
            courseType: response.data.courseType.toString(),
            partWeight: response.data.partWeight.toString()
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
          updateCourseHeaders(this.temp).then(response => {
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
    handleChange(e) {
      // this.partOptions.length = 0
      // if (e.toString() === '1') {
      //   this.partOptions.push({ value: '2', label: '期末考试' }, { value: '5', label: '平时考核' })
      // }
      // if (e.toString() === '2') {
      //   this.partOptions.push({ value: '1', label: '小测验' }, { value: '2', label: '期末考试' }, { value: '3', label: '作业' }, { value: '4', label: '大作业' })
      // }
      // if (e.toString() === '3') {
      //   this.partOptions.push({ value: '1', label: '小测验' }, { value: '3', label: '作业' }, { value: '4', label: '大作业' })
      // }
    },
    updateData1() {
      this.$refs['dataForm1'].validate((valid) => {
        if (valid) {
          upCesCourseLines(this.temp).then(response => {
            console.log(123, response.data)
            if (response.code === 200) {
              this.dialogFormVisible1 = false
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
      this.$confirm('确定要删除该课程?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          delCourseHeaders(row.id).then(response => {
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
