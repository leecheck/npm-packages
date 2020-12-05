# interval-ws

## message 封装：
```
 {
     type:String,
     success:Boolean,
     data:Object
 }
 ```

## 创建链接：
+ let new WS(window.globle.wsUrl)
## 使用demo中的ws.js 
+ 全局一个链接即可
## 引用
+ import socket from "@/util/ws"
## 组件生命周期
```
 beforeDestroy(){
   socket && socket.close()
 },
 ```
## 注册监听
+ 此时判断状态,筛选key 并直接把data取出
```
socket.listen("listenKeyAll", "all", (data,data) => {

})

socket.listen("listenKeySome", "报警", (data,type) => {

})
````