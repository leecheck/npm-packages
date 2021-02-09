export default class WS {

    constructor(wsurl) {
        if (!wsurl) {
            console.error('wsurl invalid');
            return;
        }
        this.wsurl = wsurl;
        this.setIntervalWesocketPush = null;
        this.listener = {};
        this.socket = null;
        this.createSocket();
    }

    /**
     * 建立websocket连接
     * @param {string} url ws地址
     */
    createSocket() {
        this.socket && this.socket.close()
        if (!this.socket) {
            console.log('建立websocket连接')
            this.socket = new WebSocket(this.wsurl)
            this.socket.onopen = () => {
                this.onopenWS()
            }
            this.socket.onmessage = (msg) => {
                this.onmessageWS(msg)
            }
            this.socket.onerror = () => {
                this.onerrorWS()
            }
            this.socket.onclose = () => {
                this.oncloseWS()
            }
        } else {
            console.log('websocket已连接')
        }
    }

    /**打开WS之后发送心跳 */
    onopenWS() {
        this.sendPing()
    }

    /**连接失败重连 */
    onerrorWS() {
        this.socket.close()
        clearInterval(this.setIntervalWesocketPush)
        console.log('连接失败重连中')
        if (this.socket.readyState !== 3) {
            this.socket = null
            this.createSocket()
        }
    }

    /**WS数据接收统一处理 */
    onmessageWS(e) {
        this.onMsg(e)
        this.handleEventOut(JSON.parse(e.data))
    }

    /**
     * 发送数据但连接未建立时进行处理等待重发
     * @param {any} message 需要发送的数据
     */
    connecting(message) {
        setTimeout(() => {
            if (this.socket.readyState === 0) {
                this.connecting(message)
            } else {
                this.socket.send(message)
            }
        }, 1000)
    }

    buildMsg(key, data) {
        let sendmsg = {
            type: key,
            data: data
        }
        return JSON.stringify(sendmsg)
    }

    /**
     * 发送数据
     * @param {any} message 需要发送的数据
     */
    sendWSPush(key, data) {
        let message = this.buildMsg(key, data);
        if (this.socket !== null && this.socket.readyState === 3) {
            this.socket.close()
            this.createSocket()
        } else if (this.socket.readyState === 1) {
            this.socket.send(message)
        } else if (this.socket.readyState === 0) {
            this.connecting(message)
        }
    }

    /**
     * 发送原始数据
     * @param {*} msg object
     */
    sendMsg(msg) {
        let message = JSON.stringify(msg);
        if (this.socket !== null && this.socket.readyState === 3) {
            this.socket.close()
            this.createSocket()
        } else if (this.socket.readyState === 1) {
            this.socket.send(message)
        } else if (this.socket.readyState === 0) {
            this.connecting(message)
        }
    }

    /**断开重连 */
    oncloseWS() {
        clearInterval(this.setIntervalWesocketPush)
        console.log('websocket已断开....正在尝试重连')
        if (this.socket.readyState !== 2) {
            this.socket = null
            this.createSocket()
        }
    }

    /**发送心跳
     * @param {number} time 心跳间隔毫秒 默认5000
     * @param {string} ping 心跳名称 默认字符串ping
     */
    sendPing(time = 5000) {
        clearInterval(this.setIntervalWesocketPush)
        this.sendWSPush("ping", "")
        this.setIntervalWesocketPush = setInterval(() => {
            this.sendWSPush("ping", "")
        }, time)
    }

    /**
     * 注册消息处理
     * 各组件均可调用方法
     * listenKey 组件传入一个唯一的标识符key
     * msgKeyArray ： ["","",""] 注册需要处理的消息类型
     * callback 注册回调
     */
    listen(listenKey, msgKeyArray, callback) {
        this.listener[listenKey] = {
            msgs: msgKeyArray,
            callback: callback
        }
    }

    listenOff(listenKey) {
        delete this.listener[listenKey]
    }


    closeSocket() {
        if (this.socket)
            this.socket.close()
    }

    onMsg(msg) {

    }

    handleEventOut(data) {
        let that = this;
        if (!data.success) {
            console.log('ws error:' + JSON.stringify(data))
        }
        let msgType = data.type || "error";
        Object.keys(that.listener).forEach(function(key) {
            let msgs = that.listener[key]['msgs'];
            let callback = that.listener[key]['callback'];
            if (msgs.indexOf(msgType) > -1 || msgs == "all") {
                typeof callback == 'function' && callback(data.data, msgType)
            }
        });
    }

    close() {
        this.socket && this.socket.close();
        this.socket = null;
    }

}