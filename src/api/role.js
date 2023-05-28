import request from '@/utils/request'

const baseurl = '/courseevalsys/sysIdentityHeaders'
export function getRoutes(query) {
  return request({
    url: '/courseevalsys/common/getauthsetlist',
    method: 'POST',
    params: { 'hid': query }
  })
}

export function getuserauthlist(query) {
  return request({
    url: '/courseevalsys/common/getuserauthlist',
    method: 'POST',
    params: { 'hid': query }
  })
}

export function getRoles(query) {
  return request({
    url: baseurl + '/getSysIdentityHeadersByParam',
    method: 'POST',
    params: query
  })
}

export function addRole(data) {
  return request({
    url: baseurl + '/addSysIdentityHeaders',
    method: 'POST',
    params: { 'identityName': data.identityName }
  })
}

export function updateRole(data) {
  return request({
    url: baseurl + `/upSysIdentityHeaders`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function changeAuth(data) {
  return request({
    url: `/courseevalsys/common/changeAuth`,
    method: 'POST',
    params: { 'hid': data.authid, 'id': data.id }
  })
}

export function changeuserAuth(data) {
  return request({
    url: `/courseevalsys/common/changeuserAuth`,
    method: 'POST',
    params: { 'hid': data.hid, 'id': data.id }
  })
}

export function deleteRole(id) {
  return request({
    url: baseurl + `/removeSysIdentityHeaders`,
    method: 'POST',
    params: { 'id': id }
  })
}

// 获取角色权限设置列表
export function getAuthSetList(query) {
  return request({
    url: '/courseevalsys/common/getauthsetlist',
    method: 'POST',
    params: query
  })
}

export function changeUserAuth(data) {
  return request({
    url: `/courseevalsys/common/changeuserAuth`,
    method: 'POST',
    params: { 'hid': data.authid, 'id': data.id }
  })
}
