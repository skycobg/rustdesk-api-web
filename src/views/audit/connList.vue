<template>
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="80px">
        <el-form-item :label="T('Peer')">
          <el-input v-model="listQuery.peer_id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="T('FromPeer')">
          <el-input v-model="listQuery.from_peer" clearable></el-input>
        </el-form-item>
        <!-- SKY: technician and dates -->
        <el-form-item :label="T('Technician')">
          <el-input v-model="listQuery.from_name" clearable></el-input>
        </el-form-item>
        <el-form-item :label="T('DateRange')">
          <el-date-picker v-model="dates" type="daterange" value-format="YYYY-MM-DD" unlink-panels clearable style="width: 240px"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlerQuery">{{ T('Filter') }}</el-button>
          <el-button type="danger" @click="toBatchDelete">{{ T('BatchDelete') }}</el-button>
          <el-button type="success" @click="toExport">{{ T('Export') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <el-table :data="listRes.list" v-loading="listRes.loading" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" width="50"/>
        <el-table-column prop="id" label="ID" align="center" width="100"/>
        <el-table-column :label="T('Peer')" prop="peer_id" align="center" width="120"/>
        <el-table-column :label="T('FromPeer')" prop="from_peer" align="center" width="120"/>
        <el-table-column :label="T('FromName')" prop="from_name" align="center" width="120"/>
        <el-table-column :label="T('Ip')" prop="ip" align="center" width="120"/>
        <el-table-column pop="type" :label="T('Type')" align="center" width="150">
          <template #default="{row}">
            <!-- SKY: every type; an attempt without access has no from_peer -->
            <el-tag v-if="!row.from_peer" type="info">{{ T('NotAuthorized') }}</el-tag>
            <el-tag v-else-if="row.type === 1" type="warning">{{ T('File') }}</el-tag>
            <el-tag v-else-if="row.type === 2" type="success">{{ T('PortForward') }}</el-tag>
            <el-tag v-else-if="row.type === 3" type="success">{{ T('Camera') }}</el-tag>
            <el-tag v-else-if="row.type === 4" type="success">{{ T('Terminal') }}</el-tag>
            <el-tag v-else>{{ T('Common') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="T('CreatedAt')" align="center" width="170"/>
        <el-table-column :label="T('CloseTime')" prop="close_time" align="center" width="170"/>
        <el-table-column :label="T('Duration')" prop="duration" align="center" width="130"/>
        <el-table-column :label="T('Note')" prop="note" align="left" min-width="200" show-overflow-tooltip/>
        <el-table-column :label="T('NoteBy')" prop="note_by" align="center" width="110"/>
        <el-table-column prop="uuid" label="uuid" align="center" width="120" show-overflow-tooltip/>
        <el-table-column :label="T('Actions')" align="center" width="150">
          <template #default="{row}">
            <el-button type="danger" @click="del(row)">{{ T('Delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="list-page" shadow="hover">
      <el-pagination background
                     layout="prev, pager, next, sizes, jumper"
                     :page-sizes="[10,20,50,100]"
                     v-model:page-size="listQuery.page_size"
                     v-model:current-page="listQuery.page"
                     :total="listRes.total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
  import { onActivated, onMounted, ref, watch } from 'vue'
  import { useRepositories } from '@/views/audit/reponsitories'
  import { T } from '@/utils/i18n'

  const {
    listRes,
    listQuery,
    getList,
    handlerQuery,
    del,
    batchdel,
    toExport,
  } = useRepositories()

  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)

  watch(() => listQuery.page_size, handlerQuery)
  // SKY: the date range picker fills from/to
  const dates = ref(null)
  watch(dates, (v) => {
    listQuery.from = v ? v[0] : null
    listQuery.to = v ? v[1] : null
  })
  const multipleSelection = ref([])
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  const toBatchDelete = () => {
    if (multipleSelection.value.length === 0) {
      return
    }
    batchdel(multipleSelection.value)
  }
</script>

<style scoped lang="scss">

</style>
