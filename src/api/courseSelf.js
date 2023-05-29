import request from '@/utils/request'

const baseurl = '/courseevalsys/cesCourseSelf'
const baseurl1 = '/courseevalsys/common'
export function getCesCourseSelf(query) {
  return request({
    url: baseurl + '/getCesCourseSelfByParam',
    method: 'POST',
    params: query
  })
}

export function addCesCourseSelf(data) {
  return request({
    url: baseurl + '/addCesCourseSelf',
    method: 'POST',
    params: { 'courseId': data.courseId, 'studentId': data.studentId, 'seltLevel': data.seltLevel }
  })
}

export function updateCesCourseSelf(data) {
  return request({
    url: baseurl + `/upCesCourseSelf`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delCesCourseSelf(id) {
  return request({
    url: baseurl + `/removeCesCourseSelf`,
    method: 'POST',
    params: { 'id': id }
  })
}

export function getGradeInfo(query) {
  return request({
    url: baseurl1 + '/getStudentRepotCal',
    method: 'POST',
    params: query
  })
}
