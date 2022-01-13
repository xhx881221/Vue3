import zh from "../../locales/zh";
import en from "../../locales/en";

const state = {
    websocket: null
}
  
const getters = {}
  
const actions = {
    buildWebsocket ({ dispatch, state }, meetingRoomId) {
        return new Promise((resolve, reject) => {
            let websocketUrl = sessionStorage.getItem("websocketUrl");
            if (!("WebSocket" in window) || state.websocket !== null || !websocketUrl) {
                dispatch("notification", (window.localStorage.getItem("locale") === "zh" ? zh : en).Message['Failed To Establish Websocket Connection'], { root: true });
                reject();
            }
            state.websocket = new WebSocket(`${websocketUrl}/${meetingRoomId}`);
            resolve(state.websocket);
        });
    },
    closeWebsocket({ dispatch, state }) {
        if (state.websocket.readyState === 3) {
            state.websocket.close();
            state.websocket = null;
        } else {
            dispatch("notification", "已经关闭", { root: true });
        }
    },
    sendMessage({ dispatch, state }, message) {
        if (state.websocket.readyState === 1) {
            state.websocket.send(message);
        } else {
            dispatch("notification", "websocket未连接", { root: true });
        }
    }
}

const mutations = {}
  
export default {
    state,
    getters,
    actions,
    mutations
}