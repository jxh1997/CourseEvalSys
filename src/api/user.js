import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'courseevalsys/common/login',
    method: 'POST',
    params: { 'username': data.username, 'password': data.password }
  })
}

export function getInfo(token) {
  console.log(token)
  return request({
    url: 'courseevalsys/common/getauthlist',
    method: 'POST',
    params: { 'uid': token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'POST'
  })
}
