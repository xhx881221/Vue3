const state = {
    id: null,
    timer: 6000,
    flag: false,
    message: ""
}
  
const getters = {}
  
const actions = {
    notification : {
        root: true,
        handler ({ state }, message) {
            state.message = message;
            if (state.id) {
                clearTimeout(state.id);
                state.id = setTimeout(() => { 
                    state.flag = false;
                    clearTimeout(state.id);
                    state.id = null;
                }, state.timer)
            } else {
                state.flag = true;
                state.id = setTimeout(() => { 
                    state.flag = false;
                    clearTimeout(state.id);
                    state.id = null;
                }, state.timer)
            }
        }
    },
}

const mutations = {}
  
export default {
    state,
    getters,
    actions,
    mutations
}