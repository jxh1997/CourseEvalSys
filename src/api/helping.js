import request from '@/utils/request'

const baseurl = '/courseevalsys/cesHelpInfo'
export function getHelpInfo(query) {
  return request({
    url: baseurl + '/getCesHelpInfoByParam',
    method: 'POST',
    params: query
  })
}

export function addHelpInfo(data) {
  return request({
    url: baseurl + '/addCesHelpInfo',
    method: 'POST',
    params: { 'studentId': data.studentId, 'classId': data.classId, 'teacherId': data.teacherId, 'helpDesc': data.helpDesc }
  })
}

export function updateHelpInfo(data) {
  return request({
    url: baseurl + `/upCesHelpInfo`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delHelpInfo(id) {
  return request({
    url: baseurl + `/removeCesHelpInfo`,
    method: 'POST',
    params: { 'id': id }
  })
}
