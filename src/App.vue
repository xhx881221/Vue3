<template>
	<div
		id="app"
		v-loading="isloading"
		:element-loading-text="$t('Message.Desperately Loading')">
		<div id="home" v-if="hasSetting">

		</div>

		<setting v-else @buildWebsocket="buildWebsocket"></setting>

		<div class="tooltips" v-show="canDisplay">{{message}}</div>
	</div>
</template>

<script>
	import { reactive, toRefs, computed } from 'vue';
	import { useStore } from 'vuex';
	import { AXIOS_INSTANCE as $axios } from "./request/http";
	import { useI18n } from 'vue-i18n';
	import Setting from "./features/Setting.vue";

	export default {
		name: 'App',
		components: {
			Setting
		},
		setup() {
			const store = useStore();
			const { t } = useI18n();
			let timer = null;
			let showMeeting = function(data) {
				console.log(data);
			};

			let getMeetings = function() {
				$axios.get("meetingsys/meeting/getCurrentMeeting", { 
					baseURL: sessionStorage.getItem("Meeting Service"),
					params: {
						meetingRoomId: sessionStorage.getItem("meetingRoomId")
					}
				}).then((response) => {
					if (response.success && response.data !== null) {
						if (response.data.participants.findIndex((participant) => { return participant.terminalId === sessionStorage.getItem("terminalId") }) !== -1) {
							store.dispatch("notification", response.message);
							state.hasSetting = true;
							showMeeting(response.data);
						}
					} else {
						store.dispatch("notification", response.message);
					}
				});
			}
			let MeetingInformation = function(content) {
				let _obj = JSON.parse(content.data)
				if (content.success && _obj.participants.findIndex((participant) => { return participant.terminalId === sessionStorage.getItem("terminalId") }) !== -1) {
					store.dispatch("notification", content.message);
					state.hasSetting = true;
					showMeeting(_obj);
				}
			};
			let RegisterTerminalResult = function(content) {
				if (content.success) {
					store.dispatch("notification", content.message);
					localStorage.setItem("token", content.data);
					getMeetings();
				} else {
					store.dispatch("notification", content.message);
					timer = setTimeout(register, 200000);
				}
			};
			const TYPE_DICTIONARY = {
				4: MeetingInformation,
				6: RegisterTerminalResult,
			};
			let transDateTime = function(date) {
                let currentDate = new Date(date);
                let _year = currentDate.getFullYear();
                let _month = currentDate.getMonth() < 9 ? "0" + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
                let _date = currentDate.getDate() < 10 ? "0" + currentDate.getDate() : currentDate.getDate();
                let _hour = currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours();
                let _minute = currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes();
                let _second = currentDate.getSeconds() < 10 ? "0" + currentDate.getSeconds() : currentDate.getSeconds();

                return `${_year}-${_month}-${_date} ${_hour}:${_minute}:${_second}`;
            };
			let register = function() {
				clearTimeout(timer);
				timer = null;
				let _obj = {
					from: sessionStorage.getItem("terminalId"),
					createTime: transDateTime(Date.now()),
					messageType: 5,
					content: {
						terminalId: sessionStorage.getItem("terminalId"),
						alias: sessionStorage.getItem("alias"),
						meetingRoomId: sessionStorage.getItem("meetingRoomId"),
						deviceCode: "",
						macAddress: window.jsBridge.getMacAddr()
					}
				}
				store.dispatch("sendMessage", JSON.stringify(_obj));
			}
			let getOpen = function() {
				store.dispatch("notification", t('Message.Connection Normally'));
				register();
			};
			let getMessage = function(event) {
				console.info("***接收消息***");
				let _obj = JSON.parse(event.data);
				if (_obj.to !== "" && _obj.to !== sessionStorage.getItem("terminalId")) {
					return;
				}
				TYPE_DICTIONARY[_obj.messageType](_obj.content);
			};
			let getClose = function() {
				store.dispatch("notification", t('Message.Close The Connection'));
			};
			let getError = function() {
				store.dispatch("notification", t('Message.Connection Exception'));
			};
			const state = reactive({
				hasSetting: false
			})
			const methods = {
				buildWebsocket(meetingRoomId) {
					store.dispatch("buildWebsocket", meetingRoomId).then((websocket) => {
						websocket.onopen = getOpen;
						websocket.onmessage = getMessage;
						websocket.onclose = getClose;
						websocket.onerror = getError;
					}).catch((err) => { console.log(err); })
				}
			};
			return { 
				isloading: computed(() => store.state.authorization.loading),
				canDisplay: computed(() => store.state.showMessage.flag),
				message: computed(() => store.state.showMessage.message),
				...toRefs(state),
				...methods
			}
		}
	}
</script>

<style>
	@import "styles/reset.css";

	#app {
		width: 100%;
		height: 100%;
	}
</style>

<style scoped>
	.tooltips {
		width: 200px;
		height: 40px;
		background-color: rgba(0, 0, 0, 0.6);
		color: white;
		position: fixed;
		right: 0;
		bottom: 0;
		z-index: 1;
	}
</style>