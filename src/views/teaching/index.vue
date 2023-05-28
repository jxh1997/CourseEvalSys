<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加教学计划
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
      <el-table-column label="大纲编号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属课程" align="center">
        <template slot-scope="{row}">
          <span>{{ getCourseName(row.courseId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="warn" size="mini" @click="dowbloadFile(row)">
            下载大纲
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
        <el-form-item label="所属课程" prop="courseId">
          <el-select ref="select" v-model="temp.courseId" :disabled="dialogStatus==='create' ? false : true" placeholder="请选择课程">
            <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="教学大纲" prop="fileId">
          <div>
            <el-button :style="{background:'#1890ff',borderColor:'#1890ff'}" icon="el-icon-upload" size="mini" type="primary" @click="dialogVisible=true">教学大纲上传</el-button>
          </div>
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

    <el-dialog :visible.sync="dialogVisible">
      <el-upload
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        :limit="1"
        class="editor-slide-upload"
        action="/api/courseevalsys/common/uploadfile"
        list-type="picture-card"
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
import { getCourseHeaders } from '@/api/course'
import {
  addCourseFramework,
  delCourseFramework,
  downloadFile,
  getCourseFramework,
  updateCourseFramework
} from '@/api/teaching' // secondary package based on el-pagination

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
      dialogVisible: false,
      listObj: {},
      fileList: [],
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
        fileId: undefined,
        courseId: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑计划',
        create: '添加计划'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      courseOptions: []
    }
  },
  created() {
    this.getCourseList()
    this.getList()
  },
  methods: {
    getCourseName(row) {
      let cName = '-'
      this.courseOptions.map((c) => {
        c.value === row && (cName = c.label)
      })
      return cName
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
    getList() {
      this.listLoading = true
      getCourseFramework(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.listLoading = false
      })
    },
    checkAllSuccess() {
      return true
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
    handleSuccess(response, file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      if (response.code !== 200) {
        this.$notify({
          title: 'Fail',
          dangerouslyUseHTMLString: true,
          message: response.msg,
          type: 'error'
        })
      } else {
        this.temp.fileId = response.data.id
        for (let i = 0, len = objKeyArr.length; i < len; i++) {
          if (this.listObj[objKeyArr[i]].uid === uid) {
            this.listObj[objKeyArr[i]].fileid = response.data.id
            this.listObj[objKeyArr[i]].hasSuccess = true
            return
          }
        }
      }
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
        fileId: undefined,
        courseId: undefined
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
          addCourseFramework(this.temp).then(response => {
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
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateCourseFramework(this.temp).then(response => {
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
      this.$confirm('确定要删除该大纲?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          delCourseFramework(row.id).then(response => {
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
    dowbloadFile(row) {
      downloadFile(row.fileId).then(response => {
        if (response.code === 200) {
          var downloadpath = '/api/upload/'
          const a = document.createElement('a')
          a.style.display = 'none'
          a.setAttribute('target', '_blank')
          response.data.filename.split('-')[1] && a.setAttribute('download', response.data.filename.split('-')[1])
          a.href = downloadpath + response.data.filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          this.$notify({
            title: 'Success',
            dangerouslyUseHTMLString: true,
            message: `下载成功`,
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
