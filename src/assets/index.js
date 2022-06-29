// import Vue from 'vue';
// import { SvgIcon } from '@xiwicloud/components'; // svg component

// Vue.component('svg-icon', SvgIcon);

const req = require.context('./svg', false, /\.svg$/)
// const reqs = require.context('../../../node_modules/@xiwicloud/components/src/assets/icons/svg', false, /\.svg$/)
console.log(req.keys(), 'req')
const requireAll = requireContext => {
  return requireContext.keys().map(requireContext)
}

export default requireAll(req)
