<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'
import { computed, ref } from 'vue';

const emit = defineEmits(['addContact'])

// const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL
// const supabaseKey = import.meta.env.VITE_APP_SUPABASE_KEY
const supabaseUrl = "https://cexjotyxqjbfepuuuouo.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNleGpvdHl4cWpiZmVwdXV1b3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAyODU4ODcsImV4cCI6MjAxNTg2MTg4N30.XFxYCkBHVDkWP-HgCgCQYg7xA6sg84yibrsWi0P10Uo"
const supabase = createClient(supabaseUrl, supabaseKey)
const twitterHandle = ref('')
const email = ref('')
const isLoading = ref(false)

const twitterValid = computed(() => {
    const regex = new RegExp(/^(?:@)?(\w){1,15}$/)
    return regex.test(twitterHandle.value)
})

const emailValid = computed(() => {
    const regex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    return regex.test(email.value)
})

const addContact = (
    event: Event
) => {
    event.preventDefault()
    isLoading.value = true
    supabase
        .from('contacts')
        .insert([
            { twitter: twitterHandle.value, email: email.value }
        ])
        .then(() => {
            twitterHandle.value = ''
            email.value = ''
            isLoading.value = false
            emit('addContact')
        })
}
</script>

<template>
    <form @submit="addContact($event)" class="flex flex-col-reverse sm:flex-row gap-8 items-center">
        <button type="submit" :disabled="!twitterValid || !emailValid || isLoading"
            class="uppercase mx-0 min-w-[13.3rem] py-2 px-4 text-lg text-center transition duration-200 hover:scale-110 bg-white text-black p-1 cursor-pointer z-10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
            {{ isLoading ?
                'submitting...'
                : 'get beta access' }}
        </button>
        <div class="flex flex-col sm:flex-row gap-4">
            <input type="email" name="email" v-model="email" placeholder="Email"
                :class="{ 'border-red-500': email && !emailValid }"
                class="border border-solid border-white bg-transparent h-10 rounded-xl pl-3 text-white w-full outline-none min-w-[16rem]">
            <input type="text" name="twitter" v-model="twitterHandle" placeholder="Twitter Handle"
                :class="{ 'border-red-500': twitterHandle && !twitterValid }"
                class="border border-solid border-white bg-transparent h-10 rounded-xl pl-3 text-white w-full outline-none min-w-[16rem]">
        </div>
    </form>
</template>