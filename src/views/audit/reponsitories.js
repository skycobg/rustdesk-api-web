import { reactive } from 'vue'
import { list, remove, fileList, fileRemove, batchDelete, fileBatchDelete } from '@/api/audit'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatTime } from '@/utils/time'
import { T } from '@/utils/i18n'
import { downBlob, jsonToCsv } from '@/utils/file'

// SKY: seconds as "1 ч 05 мин" / "4 мин 10 с"
export function formatDuration (s) {
  s = Math.round(s)
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h} ч ${String(m).padStart(2, '0')} мин`
  if (m > 0) return `${m} мин ${String(sec).padStart(2, '0')} с`
  return `${sec} с`
}

export function useRepositories () {
  const listRes = reactive({
    list: [], total: 0, loading: false,
  })
  const listQuery = reactive({
    page: 1,
    page_size: 10,
    peer_id: null,
    from_peer: null,
    from_name: null, // SKY
    from: null, // SKY: YYYY-MM-DD
    to: null,
  })

  const getList = async () => {
    listRes.loading = true
    const res = await list(listQuery).catch(_ => false)
    listRes.loading = false
    if (res) {
      listRes.list = res.data.list.map(item => {
        // SKY: the duration (from the connection to its close; created_at is local "YYYY-MM-DD HH:mm:ss")
        const start = item.created_at ? Date.parse(item.created_at.replace(' ', 'T')) / 1000 : 0
        item.duration = item.close_time && start && item.close_time >= start ? formatDuration(item.close_time - start) : (item.close_time ? '-' : T('Open'))
        item.close_time = item.close_time ? formatTime(item.close_time * 1000) : '-'
        return item
      })
      listRes.total = res.data.total
    }
  }
  const handlerQuery = () => {
    if (listQuery.page === 1) {
      getList()
    } else {
      listQuery.page = 1
    }
  }

  const del = async (row) => {
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('Delete') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) {
      return false
    }

    const res = await remove({ id: row.id }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      getList()
    }
  }
  const batchdel = async (rows) => {
    const ids = rows.map(r => r.id)
    if (!ids.length) {
      ElMessage.warning(T('PleaseSelectData'))
      return false
    }
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('BatchDelete') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) {
      return false
    }

    const res = await batchDelete({ ids }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      getList()
    }
  }

  const toExport = async () => {
    const q = { ...listQuery }
    q.page_size = 1000000
    q.page = 1
    const res = await list(q).catch(_ => false)
    if (res) {
      const csv = jsonToCsv(res.data.list)
      downBlob(csv, 'connectLog.csv')
    }
  }
  return {
    listRes,
    listQuery,
    getList,
    handlerQuery,
    del,
    batchdel,
    toExport,
  }
}

export function useFileRepositories () {
  const listRes = reactive({
    list: [], total: 0, loading: false,
  })
  const listQuery = reactive({
    page: 1,
    page_size: 10,
    peer_id: null,
    from_peer: null,
  })

  const getList = async () => {
    listRes.loading = true
    const res = await fileList(listQuery).catch(_ => false)
    listRes.loading = false
    if (res) {
      listRes.list = res.data.list.map(item => {
        item.info = item.info ? JSON.parse(item.info) : '-'
        return item
      })
      listRes.total = res.data.total
    }
  }
  const handlerQuery = () => {
    if (listQuery.page === 1) {
      getList()
    } else {
      listQuery.page = 1
    }
  }

  const del = async (row) => {
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('Delete') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) {
      return false
    }

    const res = await fileRemove({ id: row.id }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      getList()
    }
  }
  const batchdel = async (rows) => {
    const ids = rows.map(r => r.id)
    if (!ids.length) {
      ElMessage.warning(T('PleaseSelectData'))
      return false
    }
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('BatchDelete') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) {
      return false
    }

    const res = await fileBatchDelete({ ids }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      getList()
    }
  }

  const toExport = async () => {
    const q = { ...listQuery }
    q.page_size = 1000000
    q.page = 1
    const res = await fileList(q).catch(_ => false)
    if (res) {
      const csv = jsonToCsv(res.data.list)
      downBlob(csv, 'fileTransformLog.csv')
    }
  }

  return {
    listRes,
    listQuery,
    getList,
    handlerQuery,
    del,
    batchdel,
    toExport,
  }
}
