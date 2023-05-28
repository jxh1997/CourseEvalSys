import request from '@/utils/request'

const baseurl = '/courseevalsys/cesCourseFramework'
export function getCourseFramework(query) {
  return request({
    url: baseurl + '/getCesCourseFrameworkByParam',
    method: 'POST',
    params: query
  })
}

export function addCourseFramework(data) {
  return request({
    url: baseurl + '/addCesCourseFramework',
    method: 'POST',
    params: { 'courseId': data.courseId, 'fileId': data.fileId }
  })
}

export function updateCourseFramework(data) {
  return request({
    url: baseurl + `/upCesCourseFramework`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delCourseFramework(id) {
  return request({
    url: baseurl + `/removeCesCourseFramework`,
    method: 'POST',
    params: { 'id': id }
  })
}

export function downloadFile(id) {
  return request({
    url: `/courseevalsys/sysFileInfo/getSysFileInfoById`,
    method: 'get',
    params: { 'id': id }
  })
}
