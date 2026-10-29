// SKY: "My address book" can be renamed by its owner (the name is kept on the user).
import { ref } from 'vue'
import { T } from '@/utils/i18n'
import { personalName } from '@/api/my/address_book_collection'

export const personalAbName = ref('')

export async function loadPersonalAbName () {
  const res = await personalName().catch(_ => false)
  if (res && res.data) {
    personalAbName.value = res.data.name || ''
  }
}

export function personalAbLabel () {
  return personalAbName.value || T('MyAddressBook')
}
