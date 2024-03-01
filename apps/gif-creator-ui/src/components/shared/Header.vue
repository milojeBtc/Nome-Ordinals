<script setup lang="ts">
import logo from "../../assets/images/logo-with-slant.svg";
</script>
<template>
    <div class="min-h-[11.7rem] relative">
        <a class="w-[48%] md:w-[23%] mx-0 mb-20 mt-6 invert hover:bg-bottom relative inline-block bg-no-repeat bg-cover bg-top before:absolute before:top-0 before:bottom-[-19%] before:left-0 before:right-0 after:absolute after:w-[99%] after:h-[8%] after:bottom-[-19%]"
            href="/" :style="{ backgroundImage: `url(${logo})` }">
            <img src="../../assets/images/logo-blank.png" alt="" class="block w-full" />
        </a>
        <a class="right-0 top-0 absolute text-[20px] leading-[15px] mx-0 mt-6 mb-20 text-white underline transition-all duration-75 hover:italic underline-offset-8 hover:underline"
            href="https://nome.gallery">
            Gallery
        </a>
    </div>
</template>