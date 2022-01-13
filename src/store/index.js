import { createStore } from 'vuex';
import authorization  from './modules/authorization';
import showMessage from './modules/showMessage';
import socket from './modules/socket';

const store = createStore({
    modules: {
        authorization: authorization,
        showMessage: showMessage,
        socket: socket
    }
});

export default store;