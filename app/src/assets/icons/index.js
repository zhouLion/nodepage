import Vue from 'vue';
import Icon from '@/components/Icon.vue'; // svg组件

Vue.component('icon', Icon);

const requireAll = requireContext => requireContext.keys().map(requireContext);
const req = require.context('.', true, /\.svg$/);
requireAll(req);
