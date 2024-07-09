import { defineStore } from 'pinia';
import Config from '@/models/Config';
import DOMPurify from 'dompurify';

/**
 * Controls the state and everything related to the config.
 * @returns {Object} The store object.
 */
export const useConfigStore = defineStore({
  id: 'configStore',
  state: (): {
    ready: boolean,
    designMode: boolean,
    config: Config,
    customCSS: string,
  } => ({
    ready: false,
    config: new Config(),
    designMode: false,
    customCSS: '',
  }),
  actions: {
    setCustomCSS(css: string) {
      const style = document.getElementById('custom-css');
      if (style) {
        style.innerHTML = css;
        console.log(DOMPurify.sanitize(css));
      }
    }
  }
});