import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/courseevalsys/sysUserHeaders/getSysUserHeadersByParam',
    method: 'POST',
    params: query
  })
}

export function resetpassword(query) {
  return request({
    url: '/courseevalsys/sysUserHeaders/resetpassword',
    method: 'POST',
    params: { 'uid': query }
  })
}

export function deluser(query) {
  return request({
    url: '/courseevalsys/sysUserHeaders/removeSysUserHeaders',
    method: 'POST',
    params: { 'id': query }
  })
}

export function updateArticle(data) {
  return request({
    url: '/courseevalsys/sysUserHeaders/upSysUserHeaders',
    method: 'POST',
    params: { 'eo': data }
  })
}
export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'POST',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'POST',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vue-element-admin/article/create',
    method: 'POST',
    data
  })
}

export function insuser(data) {
  return request({
    url: '/courseevalsys/sysUserHeaders/addSysUserHeadersNew',
    method: 'POST',
    params: { 'username': data.username, 'realname': data.realname }
  })
}
