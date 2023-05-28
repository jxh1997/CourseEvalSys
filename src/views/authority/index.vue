<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">新增用户角色</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column label="唯一标识" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="已授权用户" width="220">
        <template slot-scope="{row}">
          {{ row.identityName }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑用户角色</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑':'新增'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色名">
          <el-input v-model="role.identityName" placeholder="Role Name" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible2" :title="dialogType==='edit'?'编辑':'新增'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色名">
          <el-input v-model="role.identityName" placeholder="Role Name" />
        </el-form-item>
        <el-form-item label="菜单">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedKeys"
            class="permission-tree"
            @check="changeauth"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible2=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getRoutes, addRole, deleteRole, updateRole, changeAuth, getUserAuthList, getAuthSetList, changeUserAuth } from '@/api/role'

const defaultRole = {
  id: '',
  identityName: ''
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      dialogVisible: false,
      dialogVisible2: false,
      listQuery: {
        pageon: true,
        page: 1,
        limit: 20
      },
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'tabName'
      },
      checkedKeys: []
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getRoles(this.listQuery)
  },
  methods: {
    async getRoutes(id) {
      const res = await getRoutes(id)
      this.serviceRoutes = res.data
      this.routes = this.generateRoutes(res.data, id)
    },
    async getRoles(listQuery) {
      const res = await getAuthSetList(listQuery)
      console.log(123, res.data)
      this.rolesList = res.data
    },

    changeauth(data) {
      changeAuth(data).then(response => {
        if (response.code === 200) {
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
    },
    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, authid, basePath = '/') {
      const res = []

      for (let route of routes) {
        // skip some route
        if (route.hidden) { continue }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          id: route.id,
          authid: authid,
          tabName: route.tabName,
          ischeck: route.ischeck
        }
        if (route.ischeck === 1) {
          this.checkedKeys.push(route.id)
        }
        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      console.log(scope)
      this.getRoutes(scope.row.id)
      this.dialogType = 'edit'
      this.dialogVisible2 = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        const routes = this.generateRoutes(this.role.routes)
        this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('确定要删除该角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          deleteRole(row.id).then(response => {
            if (response.code === 200) {
              this.rolesList.splice($index, 1)
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
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        // recursive child routes
        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        updateRole(this.role).then(response => {
          if (response.code === 200) {
            const index = this.rolesList.findIndex(v => v.id === this.role.id)
            this.rolesList.splice(index, 1, this.role)
            this.dialogVisible2 = false
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
      } else {
        addRole(this.role).then(response => {
          if (response.code === 200) {
            this.getRoles(this.listQuery)
            this.dialogVisible = false
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
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
