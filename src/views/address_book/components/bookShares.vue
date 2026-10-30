<template>
  <!-- SKY: all address book shares in one list (instead of the web client links, which we do not use) -->
  <div>
    <el-card class="list-query" shadow="hover">
      <el-button type="primary" @click="load">{{ T('Refresh') }}</el-button>
      <span style="margin-left: 12px; color: var(--el-text-color-secondary)">{{ T('BookSharesTip') }}</span>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <el-table :data="rows" v-loading="loading" border>
        <el-table-column v-if="!isMy" :label="T('Owner')" align="center">
          <template #default="{row}">{{ users.find(u => u.id === row.user_id)?.username }}</template>
        </el-table-column>
        <el-table-column :label="T('AddressBook')" align="center">
          <template #default="{row}"><b>{{ books.find(b => b.id === row.collection_id)?.name || row.collection_id }}</b></template>
        </el-table-column>
        <el-table-column :label="T('ShareTo')" align="center">
          <template #default="{row}">
            <span v-if="row.type === TYPE_U">{{ users.find(u => u.id === row.to_id)?.username }}</span>
            <span v-else-if="row.type === TYPE_G">{{ T('Group') }}: {{ groups.find(g => g.id === row.to_id)?.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="T('Rule')" align="center">
          <template #default="{row}">{{ rules.find(r => r.value === row.rule)?.label }}</template>
        </el-table-column>
        <el-table-column prop="created_at" :label="T('CreatedAt')" align="center"/>
        <el-table-column :label="T('Actions')" align="center" width="160">
          <template #default="{row}">
            <el-button type="danger" @click="remove(row)">{{ T('Delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
  import { onActivated, onMounted, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { T } from '@/utils/i18n'
  import { useRepositories } from '@/views/address_book/rule'
  import { list as adminRules, remove as adminRemove } from '@/api/address_book_collection_rule'
  import { list as myRules, remove as myRemove } from '@/api/my/address_book_collection_rule'
  import { list as adminBooks } from '@/api/address_book_collection'
  import { list as myBooks } from '@/api/my/address_book_collection'

  const props = defineProps({ isMy: { type: Boolean, default: false } })
  const { rules, groups, users, getGroupUsers, TYPE_G, TYPE_U } = useRepositories(props.isMy ? 'my' : 'admin')

  const rows = ref([])
  const books = ref([])
  const loading = ref(false)

  const load = async () => {
    loading.value = true
    const q = { page: 1, page_size: 1000 }
    const [r, b] = await Promise.all([
      (props.isMy ? myRules(q) : adminRules(q)).catch(_ => false),
      (props.isMy ? myBooks(q) : adminBooks(q)).catch(_ => false),
      getGroupUsers(),
    ])
    loading.value = false
    if (r && r.data) rows.value = r.data.list || []
    if (b && b.data) books.value = b.data.list || []
  }

  const remove = async (row) => {
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('Delete') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) return
    const res = await (props.isMy ? myRemove({ id: row.id }) : adminRemove({ id: row.id })).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      load()
    }
  }

  onMounted(load)
  onActivated(load)
</script>
