import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: '首页',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/error',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    hidden: true,
    meta: {
      title: 'Error Pages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: () => import('@/views/error-page/401'),
        name: 'Page401',
        meta: { title: '401', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/views/error-page/404'),
        name: 'Page404',
        meta: { title: '404', noCache: true }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/course',
    component: Layout,
    redirect: '/course/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/course/index'),
        name: '课程管理',
        meta: { title: '课程管理', icon: 'component', noCache: true }
      }
    ]
  },
  {
    path: '/courseTarget',
    component: Layout,
    redirect: '/courseTarget/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/courseTarget/index'),
        name: '课程目标',
        meta: { title: '课程目标', icon: 'eye-open', noCache: true }
      }
    ]
  },
  {
    path: '/grade',
    component: Layout,
    redirect: '/grade/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/grade/index'),
        name: '成绩管理',
        meta: { title: '成绩管理', icon: 'chart', noCache: true }
      }
    ]
  },
  {
    path: '/courseSelf',
    component: Layout,
    redirect: '/courseSelf/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/courseSelf/index'),
        name: '自评成绩',
        meta: { title: '自评成绩', icon: 'excel', noCache: true }
      }
    ]
  },
  {
    path: '/teaching',
    component: Layout,
    redirect: '/teaching/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/teaching/index'),
        name: '教学管理',
        meta: { title: '教学管理', icon: 'education', noCache: true }
      }
    ]
  },
  {
    path: '/pagesmanager',
    component: Layout,
    redirect: '/pagesmanager/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/pagesmanager/index'),
        name: '页面管理',
        meta: { title: '页面管理', icon: 'documentation', noCache: true }
      }
    ]
  },
  {
    path: '/helping',
    component: Layout,
    redirect: '/helping/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/helping/index'),
        name: '帮扶记录',
        meta: { title: '帮扶记录', icon: 'example', noCache: true }
      }
    ]
  },
  {
    path: '/stage',
    component: Layout,
    redirect: '/stage/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/stage/index'),
        name: '级部维护',
        meta: { title: '级部维护', icon: 'nested', noCache: true }
      }
    ]
  },
  {
    path: '/class',
    component: Layout,
    redirect: '/class/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/class/index'),
        name: '班级维护',
        meta: { title: '班级维护', icon: 'list', noCache: true }
      }
    ]
  },
  {
    path: '/students',
    component: Layout,
    redirect: '/students/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/students/index'),
        name: '学生管理',
        meta: { title: '学生管理', icon: 'people', noCache: true }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    redirect: '/users/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/users/index'),
        name: '用户管理',
        meta: { title: '用户管理', icon: 'peoples', noCache: true }
      }
    ]
  },
  {
    path: '/role',
    component: Layout,
    redirect: '/role/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/role/index'),
        name: '角色管理',
        meta: { title: '角色管理', icon: 'tree', noCache: true }
      }
    ]
  },
  {
    path: '/authority',
    component: Layout,
    redirect: '/authority/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/authority/index'),
        name: '权限管理',
        meta: { title: '权限管理', icon: 'lock', noCache: true }
      }
    ]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
