import request from '@/utils/request'

const baseurl = '/courseevalsys/cesCourseHeaders'
export function getCourseHeaders(query) {
  return request({
    url: baseurl + '/getCesCourseHeadersByParam',
    method: 'POST',
    params: query
  })
}

export function addCourseHeaders(data) {
  return request({
    url: baseurl + '/addCesCourseHeaders',
    method: 'POST',
    params: { 'courseClass': data.courseClass, 'courseGrade': data.courseGrade, 'courseName': data.courseName, 'courseTeacher': data.courseTeacher, 'courseYear': data.courseYear }
  })
}

export function updateCourseHeaders(data) {
  return request({
    url: baseurl + `/upCesCourseHeaders`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delCourseHeaders(id) {
  return request({
    url: baseurl + `/removeCesCourseHeaders`,
    method: 'POST',
    params: { 'id': id }
  })
}

export function calculatorReport(id) {
  return request({
    url: `/courseevalsys/common/calculate`,
    method: 'POST',
    params: { 'courseid': id }
  })
}

export function calculateDetail(id) {
  return request({
    url: `/courseevalsys/common/calculateDetail`,
    method: 'POST',
    params: { 'courseid': id }
  })
}

export function getCesCourseLinesById(query) {
  return request({
    url: `/courseevalsys/cesCourseLines/getCesCourseLinesById`,
    method: 'get',
    params: query
  })
}

export function addCesCourseLines(data) {
  return request({
    url: `/courseevalsys/cesCourseLines/addCesCourseLines`,
    method: 'POST',
    params: { 'id': data.id, 'coursePart': data.coursePart, 'courseType': data.courseType, 'partWeight': data.partWeight }
  })
}

export function upCesCourseLines(data) {
  return request({
    url: `/courseevalsys/cesCourseLines/upCesCourseLines`,
    method: 'POST',
    params: { 'id': data.id, 'coursePart': data.coursePart, 'courseType': data.courseType, 'partWeight': data.partWeight }
  })
}
