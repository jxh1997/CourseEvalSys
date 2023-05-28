import request from '@/utils/request'

const baseurl = '/courseevalsys/cesClassInfo'
export function getClass(query) {
  return request({
    url: baseurl + '/getCesClassInfoByParam',
    method: 'POST',
    params: query
  })
}

export function addClass(data) {
  return request({
    url: baseurl + '/addCesClassInfo',
    method: 'POST',
    params: { 'createby': data.createby, 'classname': data.classname, 'gradeid': data.gradeid, 'teacherid': data.teacherid }
  })
}

export function updateClass(data) {
  return request({
    url: baseurl + `/upCesClassInfo`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delClass(id) {
  return request({
    url: baseurl + `/removeCesClassInfo`,
    method: 'POST',
    params: { 'id': id }
  })
}
