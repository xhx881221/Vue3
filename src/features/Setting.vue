<template>
    <div id="setting">
        <div class="setting-title">{{$t('Message.Welcome To Use Hushan Domestic Paperless System')}}</div>
        <label for="setting-button" class="setting-label">{{$t("Button.Setting")}}</label>
        <button id="setting-button" @click="setting"></button>
        <div class="setting-dialog" v-show="canSetting">
            <div class="setting-dialog-setting">
                <label for="meetingRoom">{{$t('Label.Meeting Room')}}</label>
                <el-select id="meetingRoom" v-model="meetingRoomId">
                    <el-option
                        v-for="meetingRoom in meetingRooms"
                        :key="meetingRoom.id"
                        :label="meetingRoom.name"
                        :value="meetingRoom.id">
                    </el-option>
                </el-select>
                <br />
                <label for="alias">{{$t('Label.Device Name')}}</label>
                <el-input id="alias" v-model="alias"></el-input>
                <div>
                    <label for="openTable">{{$t('Label.Open Table')}}</label><!--
                    --><div id="openTable" @click="operateTable($event)">
                        <div class="fake-slider-disable fake-slider-left">{{$t('Label.Open')}}</div><!--
                        --><div class="fake-slider-enable fake-slider-right">{{$t('Label.Close')}}</div>
                    </div>
                </div>
                <div class="operate-area">
                    <label for="determine-button" class="determine-label">{{$t("Button.Determine")}}</label>
					<button id="determine-button" @click="determine"></button>
                    <label for="reset-button" class="reset-label">{{$t("Button.Reset")}}</label>
					<button id="reset-button" @click="reset"></button>
                </div>
            </div><!--
            --><div class="setting-dialog-directions">
                <div>{{$t('Message.Welcome To Use Hushan Domestic Paperless System')}}</div>
                <div>{{$t('Message.We Focus On The Construction Of Paperless Systems To Provide More Professional Services For Your Meetings')}}</div>
                <div>{{$t('Message.Because Of Focus, So Professional')}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { reactive, toRefs, onMounted } from 'vue';
    import { AXIOS_INSTANCE as $axios } from "../request/http";
    import { useStore } from 'vuex';
    import { useI18n } from 'vue-i18n';

    export default {
        emits: ["buildWebsocket"],
        name: "Setting",
        setup(props, context) {
            const store = useStore();
            const { t } = useI18n();
            let toggleClass = function(el) {
                el.firstChild.classList.toggle("fake-slider-disable");
                el.firstChild.classList.toggle("fake-slider-enable");
                el.lastChild.classList.toggle("fake-slider-disable");
                el.lastChild.classList.toggle("fake-slider-enable");
            }
            let createGuid = function() {
                return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
                    let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);  
                    return v.toString(16);  
                });
            };
            const state = reactive({
                canSetting: false,
                meetingRoomId: "",
                alias: "",
                openTableCard: false,
                meetingRooms: []
            });
            const methods = {
                setting() {
                    state.canSetting = true;
                },
                operateTable(event) {
                    state.openTableCard = !state.openTableCard;
                    let parent = event.target.parentElement;
                    toggleClass(parent);
                },
                determine() {
                    if (state.meetingRoomId === "" || state.alias === "") {
                        store.dispatch("notification", t('Message.Please Select Meeting Room'));
                        return;
                    }
                    let _obj = {
                        "openTableCard": state.openTableCard,
                        "terminalId": sessionStorage.getItem("terminalId"),
                        "alias": state.alias,
                        "meetingRoomId": state.meetingRoomId
                    };
                    window.jsBridge.saveConfig(JSON.stringify(_obj));
                    state.canSetting = false;
                    context.emit("buildWebsocket", state.meetingRoomId);
                },
                reset() {
                    let _obj = {
                        "openTableCard": false,
                        "terminalId": "",
                        "alias": "",
                        "meetingRoomId": ""
                    };
                    window.jsBridge.saveConfig(JSON.stringify(_obj));
                }
            };
            let config = JSON.parse(window.jsBridge.getConfig());
            state.meetingRoomId = config.meetingRoomId;
            state.alias = config.alias;
            state.openTableCard = config.openTableCard;
            sessionStorage.setItem("alias", config.alias);
            if (config.terminalId === "") {
                config.terminalId = createGuid();
            }
            sessionStorage.setItem("meetingRoomId", config.meetingRoomId);
            sessionStorage.setItem("terminalId", config.terminalId);
            sessionStorage.setItem("websocketUrl", config.websocketUrl);
            $axios.get("meetingsys/api/getMeetingRooms", { baseURL: sessionStorage.getItem("Ignore Auth Service") }).then((response) => {
                state.meetingRooms = response.data.slice(0);
                if (state.meetingRooms.findIndex((item) => { return item.id === state.meetingRoomId; }) === -1) {
                    state.meetingRoomId = "";
                }
                if (state.meetingRoomId !== "" && state.alias !== "") {
                    let _obj = {
                        "openTableCard": state.openTableCard,
                        "terminalId": sessionStorage.getItem("terminalId"),
                        "alias": state.alias,
                        "meetingRoomId": state.meetingRoomId
                    };
                    window.jsBridge.saveConfig(JSON.stringify(_obj));
                    context.emit("buildWebsocket", state.meetingRoomId);
                } else {
                    store.dispatch("notification", t('Message.Please Select Meeting Room'));
                }
            })
            onMounted(() => {
                if (!state.openTableCard) {
                    let el = document.querySelector(".operate-area");
                    toggleClass(el);
                }
            });
            return { ...toRefs(state), ...methods }
        }
    }
</script>

<style>
    #setting .el-select {
        width: 100%;
    }

    #setting .el-input__inner {
        color: #000000;
    }
</style>

<style scoped>
    #setting {
        position: relative;
        height: 100%;
        background-image: url("../assets/setting-background.png");
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }

    .setting-title {
        font-size: 50px;
        text-align: center;
        color: white;
        padding-top: 400px;
    }

    .setting-dialog {
        position: absolute;
        width: 880px; height: 440px;
        top: 280px;
        left: calc((100% - 880px) / 2);
    }

    .setting-dialog-setting, .setting-dialog-directions {
        display: inline-block;
        width: 440px;
        height: 440px;
    }

    .setting-dialog-setting {
        vertical-align: top;
        background-color: #F8FBFF;
        padding: 40px 30px 52px 30px;
        box-sizing: border-box;
    }

    .setting-dialog-setting label {
        color: #908B8B;
        font-size: 16px;
    }

    .setting-dialog-setting .el-input, .setting-dialog-setting .el-select {
        margin-top: 8px;
        margin-bottom: 24px;
    }

    .setting-dialog-directions {
        color: #ffffff;
        background: linear-gradient(#4DA9E9, #2247B7);
        padding: 46px 68px 0 40px;
        font-size: 16px;
        font-weight: bold;
        box-sizing: border-box;
    }

    .setting-dialog-directions div:first-of-type {
        margin-bottom: 64px;
    }

    .setting-dialog-directions div:nth-of-type(2) {
        margin-bottom: 42px;
    }

    .fake-slider-disable, .fake-slider-enable {
        display: inline-block;
        width: 50px;
        height: 32px;
        font-size: 16px;
        line-height: 32px;
        text-align: center;
    }

    #openTable {
        display: inline-block;
        margin-left: 10px;
        cursor: pointer;
    }

    .fake-slider-disable {
        background-color: #3251AE;
        color: rgba(255, 255, 255, 0.65);
    }

    .fake-slider-enable {
        background-color: #2896E3;
        color: #ffffff;
    }

    .fake-slider-left {
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
    }

    .fake-slider-right {
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
    }

    .operate-area {
        margin-top: 82px;
        text-align: center;
    }

    .setting-label, .operate-area>.determine-label, .operate-area>.reset-label {
        text-align: center;
        display: inline-block;
        width: 160px;
        height: 50px;
        cursor: pointer;
        font-size: 20px;
        line-height: 50px;
        color: #ffffff;
        background-color: #3251AE;
        border-radius: 2px;
    }

    #determine-button {
        display: none;
    }

    .operate-area>.reset-label {
        background-color: #2896E3;
        margin-left: 20px;
    }

    #reset-button {
        display: none;
    }

    #setting-button {
        display: none;
    }

    .setting-label {
        margin-left: 50%;
        margin-top: 40px;
        transform: translateX(-50%);
    }
</style>