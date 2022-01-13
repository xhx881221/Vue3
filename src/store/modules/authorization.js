const state = {
    loading: false,
    loadingFlag: false
}
  
const getters = {}
  
const actions = {
    setLoadingAsync({commit}, item) {
        commit('setLoading', item);
    }

}
  
const mutations = {
    setLoading (state, item) {
        state.loading = item;
    },
    setLoadingFlag (state, item) {
        state.loadingFlag = item;
    }
}
  
export default {
    state,
    getters,
    actions,
    mutations
}