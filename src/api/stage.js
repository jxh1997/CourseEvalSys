import request from '@/utils/request'

const baseurl = '/courseevalsys/cesGradeInfo'
export function getStageinfo(query) {
  return request({
    url: baseurl + '/getCesGradeInfoByParam',
    method: 'POST',
    params: query
  })
}

export function addStage(data) {
  return request({
    url: baseurl + '/addCesGradeInfo',
    method: 'POST',
    params: { 'createby': data.createby, 'gradename': data.gradename }
  })
}

export function updateStage(data) {
  return request({
    url: baseurl + `/upCesGradeInfo`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delStage(id) {
  return request({
    url: baseurl + `/removeCesGradeInfo`,
    method: 'POST',
    params: { 'id': id }
  })
}
