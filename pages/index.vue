<script lang="ts" setup>
const { data } = await useFetch("/api/user")
const email = ref("mresente@gmail.com")
const toEmail = refDebounced(email, 1000)
const { data: gmailData, refresh } = await useFetch(() => `/api/gmail?toEmail=${toEmail.value}`)


if (!data.value) {
  navigateTo("/login")
}

async function handleLogout() {
  try {
    await $fetch("/api/logout", {
      method: "POST",
    })

    navigateTo("/login")
  } catch (error) {
    console.log(error)
  }
}
</script>
<template>
  <UContainer class="h-screen flex flex-col justify-center items-center">
    <UCard>
      <template #header>
        This page is protected and can only be accessed by authenticated users.
      </template>

      <pre class="code">{{ JSON.stringify(data, null, 2) }}</pre>
      <template #footer class="foat-right">
        <UButton label="Logout" @click="handleLogout" />
      </template>
    </UCard>

    <UCard class="max-w-prose overflow-auto">
      <template #header>
        Test gmail integration
      </template>

      <UInput v-model="email" />

      <pre class="code">{{ JSON.stringify(gmailData, null, 2) }}</pre>
      <template #footer class="foat-right">
        <UButton label="Get data" @click="refresh" />
      </template>
    </UCard>
  </UContainer>
</template>
