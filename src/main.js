import { createApp } from 'vue';
import { ElButton, ElInput, ElSelect, ElOption } from 'element-plus';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import store from './store/index';
import i18n from './locales/index';
import App from './App.vue';
import 'element-plus/dist/index.css';
import { AXIOS_INSTANCE as $axios } from "./request/http";

const app = createApp(App);
app.use(ElementPlus, {
    locale: zhCn
})
const components = [ElButton, ElInput, ElSelect, ElOption];
components.forEach(component => {
    app.component(component);
});
const plugins = [store, i18n];
plugins.forEach(plugin => {
    app.use(plugin)
});
$axios.get("/config.json", { baseURL: location.protocol + '//' + location.host }).then((response) => {
    if (response.success) {
        sessionStorage.setItem("Ignore Auth Service", response["Basic Service"] + "/ignoreAuth");
        sessionStorage.setItem("Basic Configuration Service", response["Basic Service"] + "/config");
        sessionStorage.setItem("Meeting Service", response["Basic Service"] + "/ms");
        sessionStorage.setItem("File Service", response["File Service"]);
    }
    app.mount('#app');
});