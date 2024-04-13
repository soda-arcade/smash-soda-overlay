// vue.d.ts
import Vue from '@/types/vue';

declare module 'vue/types/vue' {
  interface Vue {
    $refs: {
      [key: string]: Vue | Element | Vue[] | Element[];
    };
  }
}