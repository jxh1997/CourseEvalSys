import request from '@/utils/request'

const baseurl = '/courseevalsys/sysTab'
export function getsysTab(query) {
  return request({
    url: baseurl + '/getSysTabByParam',
    method: 'POST',
    params: query
  })
}

export function addsysTab(data) {
  return request({
    url: baseurl + '/addSysTab',
    method: 'POST',
    params: { 'tabName': data.tabName, 'tabIcon': data.tabIcon, 'tabUrl': data.tabUrl, 'tabDesc': data.tabDesc }
  })
}

export function updatesysTab(data) {
  return request({
    url: baseurl + `/upSysTab`,
    method: 'POST',
    params: { 'eo': data }
  })
}

export function delsysTab(id) {
  return request({
    url: baseurl + `/removeSysTab`,
    method: 'POST',
    params: { 'id': id }
  })
}
