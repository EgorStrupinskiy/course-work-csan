let chatSocket = new WebSocket("ws://arcade-game-center.herokuapp.com/chat")
let message = {
    userName: "",
    userId: "",
    groupId: "",
    userMessage: "",
    type: "",
    data: ""
}
let history = []
let userId
let ourId

document.getElementById("name_button").addEventListener("click", (e) => {
    if (document.getElementById("name").value === '') {
        alert("Please, enter the name")
    } else {
        e.preventDefault()
        document.getElementById("formName").style.display = "none"
        document.getElementById("formGames").style.display = "flex"
        var name = document.getElementById("name").value
        localStorage.setItem('userName', name)

        document.getElementById("chat").style.display = "block"

        // Connection
        
        chatSocket = new WebSocket("ws://arcade-game-center.herokuapp.com/chat")

        chatSocket.onopen = (e) => {
            message['userName'] = localStorage.getItem("userName")
            userName = localStorage.getItem("userName")
            message['type'] = "start"
            chatSocket.send(JSON.stringify(message))
            console.log("Socket is open")
        }

        chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data['type'] === "start") {
                message = data
                ourId = message['userId']
                // userId = message['userId']
                console.log("Message type 'start'")
                fetch('http://arcade-game-center.herokuapp.com/message/getHistory/' + data['groupId'])
                    .then((response) => {
                        return response.json()
                    })
                    .then((data) => {
                        for (var i = 0; i < data.length; i++) {
                            sendMessage(data[i])
                        }
                    })
            }
            if (data['type'] === "message") {
                console.log(data)
                console.log("Message received")
                sendMessage(data)
            }
        }
    }
})

document.getElementById("formGames").style.display = "none"
document.getElementById("leave_button").addEventListener("click", (e) => {
    e.preventDefault()
    window.location.reload()
})

function sendMessage(data) {
    var text = data['userMessage']
    var initials = data['userName']
    var date = data['data']
    var message = date + " : " + initials + ': ' + text

    var x = document.createElement("LI")
    var t = document.createTextNode(message)
    console.log(ourId)
    console.log(data['userId'])
    if (data['userId'] === ourId) {
        x.style.color = "green"
    } else {
        x.style.color = "red"
    }
    x.appendChild(t)
    x.style.fontSize = "20"
    document.getElementById("history").appendChild(x)

    //   $('<li>').text(message).appendTo('#history')
    var lemon = document.getElementById('history')
    lemon.scrollTop = lemon.scrollHeight
    document.getElementById("message").value = ""
}

document.getElementById("send_message_button").addEventListener("click", (e) => {
    message['userMessage'] = document.getElementById("message").value
    message['userName'] = localStorage.getItem("userName")
    message['type'] = "message"

    Data = new Date()
    Hour = Data.getHours()
    Minutes = Data.getMinutes()
    Seconds = Data.getSeconds()
    // ??????????
    var utcDate = (Hour + ":" + Minutes + ":" + Seconds)

    message['data'] = utcDate
    // message[]
    chatSocket.send(JSON.stringify(message))
    //   socket.emit('message', message)
    return false
})