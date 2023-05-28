import request from '@/utils/request'

const baseurl = '/courseevalsys/cesStudentInfo'
export function getStudentinfo(query) {
  return request({
    url: baseurl + '/getCesStudentInfoByParam',
    method: 'POST',
    params: query
  })
}

export function addStudent(data) {
  return request({
    url: baseurl + '/addCesStudentInfo',
    method: 'POST',
    params: { 'studentName': data.studentName, 'classId': data.classId }
  })
}

export function getClassList(data) {
  return request({
    url: '/courseevalsys/cesClassInfo/getCesClassInfoByParam',
    method: 'POST',
    params: { createby: data, pageon: false }
  })
}

export function getGradeList(data) {
  return request({
    url: '/courseevalsys/cesGradeInfo/getCesGradeInfoByParam',
    method: 'POST',
    params: { createby: data, pageon: false }
  })
}

export function updateStudent(data) {
  return request({
    url: baseurl + `/upCesStudentInfo`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delStudent(id) {
  return request({
    url: baseurl + `/removeCesStudentInfo`,
    method: 'POST',
    params: { 'id': id }
  })
}
