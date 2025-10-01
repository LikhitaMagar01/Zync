<template>
  <svg 
    :width="size" 
    :height="size"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    :class="svgFill"
  >
    <path 
      v-if="iconPath"
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      :d="iconPath"
    />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { iconPaths, type IconName } from '../../utils/icons'

type IconType = {
  iconName: IconName;
  svgFill?: string;
  size?: number;
};

const props = withDefaults(defineProps<IconType>(), {
  svgFill: "text-gray-500",
  size: 24,
});

const iconPath = computed(() => {
  return iconPaths[props.iconName] || iconPaths.home
})
</script>