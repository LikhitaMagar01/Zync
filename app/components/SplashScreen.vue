<template>
  <div class="splash-screen" v-if="showSplash">
    <div class="splash-container">
      <div class="main-icon">
        <img src="/chatOne.ico" alt="ChatOne" class="icon-main heartbeat" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showSplash = ref(true)

onMounted(() => {
  setTimeout(() => {
    showSplash.value = false
  }, 4000)
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.splash-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-main {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
}

.main-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.heartbeat {
  animation: heartbeat 1.2s ease-in-out infinite;
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.1);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(1);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .icon-main {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .icon-main {
    width: 60px;
    height: 60px;
  }
}
</style>