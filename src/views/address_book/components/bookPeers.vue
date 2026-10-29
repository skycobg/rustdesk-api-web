<template>
  <!-- SKY: the computers in the clicked address book, read only -->
  <el-card class="list-body" shadow="hover" v-if="collection">
    <template #header>
      <b>{{ T('BookPeers') }}: {{ collection.name }}</b>
      <span style="margin-left: 8px; color: var(--el-text-color-secondary)">({{ rows.length }})</span>
    </template>
    <el-table :data="rows" v-loading="loading" border size="small">
      <el-table-column type="index" width="50" align="center"/>
      <el-table-column prop="id" label="ID" align="center" width="160"/>
      <el-table-column prop="alias" :label="T('Alias')" align="center"/>
      <el-table-column prop="hostname" :label="T('Hostname')" align="center"/>
      <el-table-column prop="username" :label="T('Username')" align="center"/>
      <el-table-column prop="platform" :label="T('Platform')" align="center" width="110"/>
      <el-table-column :label="T('Tags')" align="center">
        <template #default="{row}">
          <el-tag v-for="t in (row.tags || [])" :key="t" size="small" style="margin: 2px">{{ t }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="note" :label="T('Note')" align="center" show-overflow-tooltip/>
    </el-table>
  </el-card>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { T } from '@/utils/i18n'
  import { list as myList } from '@/api/my/address_book'
  import { list as adminList } from '@/api/address_book'

  // collection: { id, name, user_id }; isMy: the "Моите" page (own books, incl. id 0 = the personal book)
  const props = defineProps({
    collection: { type: Object, default: null },
    isMy: { type: Boolean, default: false },
  })

  const rows = ref([])
  const loading = ref(false)

  const load = async () => {
    rows.value = []
    const c = props.collection
    if (!c) return
    loading.value = true
    const params = { page: 1, page_size: 1000, collection_id: c.id }
    if (!props.isMy) params.user_id = c.user_id
    const res = await (props.isMy ? myList(params) : adminList(params)).catch(_ => false)
    loading.value = false
    if (res && res.data && props.collection === c) {
      rows.value = res.data.list || []
    }
  }

  watch(() => props.collection, load, { immediate: true })
</script>
