import request from '@/utils/request'

export function list (params) {
  return request({
    url: '/my/address_book_collection/list',
    params,
  })
}

export function create (data) {
  return request({
    url: '/my/address_book_collection/create',
    method: 'post',
    data,
  })
}

export function update (data) {
  return request({
    url: '/my/address_book_collection/update',
    method: 'post',
    data,
  })
}

export function remove (data) {
  return request({
    url: '/my/address_book_collection/delete',
    method: 'post',
    data,
  })
}


// SKY: the user's own name for "My address book"
export function personalName () {
  return request({
    url: '/my/address_book_collection/personal',
  })
}

export function setPersonalName (data) {
  return request({
    url: '/my/address_book_collection/personal',
    method: 'post',
    data,
  })
}
