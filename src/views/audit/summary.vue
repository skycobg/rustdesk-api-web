<template>
  <!-- SKY: sessions and total time per technician in a period -->
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="90px">
        <el-form-item :label="T('DateRange')">
          <el-date-picker v-model="dates" type="daterange" value-format="YYYY-MM-DD" unlink-panels style="width: 240px"/>
        </el-form-item>
        <el-form-item :label="T('Technician')">
          <el-input v-model="query.from_name" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">{{ T('Filter') }}</el-button>
        </el-form-item>
      </el-form>
      <div style="color: var(--el-text-color-secondary); font-size: 13px">{{ T('WorkTimeTip') }}</div>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <el-table :data="rows" v-loading="loading" border show-summary :summary-method="totals">
        <el-table-column :label="T('Technician')" prop="from_name" align="left" min-width="160"/>
        <el-table-column :label="T('Sessions')" prop="sessions" align="center" width="120"/>
        <el-table-column :label="T('TotalTime')" prop="time" align="center" width="160"/>
        <el-table-column :label="T('OpenSessions')" prop="open" align="center" width="140"/>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
  import { onActivated, onMounted, reactive, ref } from 'vue'
  import { summary } from '@/api/audit'
  import { formatDuration } from '@/views/audit/reponsitories'
  import { T } from '@/utils/i18n'

  const pad = (n) => String(n).padStart(2, '0')
  const day = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const now = new Date()
  const dates = ref([day(new Date(now.getFullYear(), now.getMonth(), 1)), day(now)]) // this month
  const query = reactive({ from_name: null })
  const rows = ref([])
  const loading = ref(false)
  let raw = []

  const load = async () => {
    loading.value = true
    const res = await summary({ from: dates.value?.[0], to: dates.value?.[1], from_name: query.from_name }).catch(_ => false)
    loading.value = false
    if (res) {
      raw = res.data.list || []
      rows.value = raw.map(r => ({ ...r, from_name: r.from_name || '-', time: formatDuration(r.seconds) }))
    }
  }
  const totals = ({ columns }) => columns.map((c, i) => {
    if (i === 0) return T('TotalTime')
    if (c.property === 'sessions') return raw.reduce((a, r) => a + r.sessions, 0)
    if (c.property === 'time') return formatDuration(raw.reduce((a, r) => a + r.seconds, 0))
    if (c.property === 'open') return raw.reduce((a, r) => a + r.open, 0)
    return ''
  })
  onMounted(load)
  onActivated(load)
</script>
