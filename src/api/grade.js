import request from '@/utils/request'

const baseurl = '/courseevalsys/cesReportInfo'
const baseurl1 = '/courseevalsys/common'
export function getReportInfo(query) {
  return request({
    url: baseurl + '/getCesReportInfoByParam',
    method: 'POST',
    params: query
  })
}

export function addReportInfo(data) {
  return request({
    url: baseurl + '/addCesReportInfo',
    method: 'POST',
    params: { 'courseId': data.courseId, 'studentId': data.studentId, 'repVal': data.repVal, 'repType': data.repType }
  })
}

export function updateReportInfo(data) {
  return request({
    url: baseurl + `/upCesReportInfo`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delReportInfo(id) {
  return request({
    url: baseurl + `/removeCesReportInfo`,
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
