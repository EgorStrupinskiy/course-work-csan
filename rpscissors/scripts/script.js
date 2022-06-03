var playerChoice = 0
const playerOptions = ['paper', 'rock', 'scissors'];
const computerOptions = ['paper', 'rock', 'scissors']
var computerChoice = 0
var state = "offline"
let moves = 0
let playerScore = 0
let computerScore = 0
var lobbies = {}
var id
let message = {
    userName: "",
    userId: "",
    groupId: "",
    userMessage: "",
    type: "",
    data: ""
}

let userInfo = {
    userName: '',
    userChoice: '',
    sessionStatus: ''
}
var socket
var chatSocket
var groupId

document.getElementById("lobby_find_button").addEventListener("click", (e) => {
    document.getElementById("mode_choose").style.display = "none"
    document.getElementById("rooms").style.display = "flex"
    getRooms()
})

document.getElementById("lobby_refresh_button").addEventListener("click", (e) => {
    var curLobbies = document.getElementById("lobbies")
    while (curLobbies.lastChild) {
        curLobbies.removeChild(curLobbies.lastChild);
    }
    getRooms()
})


function getRooms() {
    fetch('http://localhost:8080/message/getAllRooms')
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            lobbies = data
            console.log(data)
            console.log(lobbies[0].name)
            document.getElementById("loader").style.display = "none"
            for (let i = 0; i < lobbies.length; i++) {
                var x = document.createElement("A")
                console.log(lobbies[0].name)
                var t = document.createTextNode(lobbies[i].name + " (" + lobbies[i].currentPeopleCount + "/" + lobbies[i].maxPeopleCount + ")")
                x.appendChild(t)
                x.setAttribute('href', '#');
                x.classList.add("lobby")
                x.addEventListener('click', function () {
                    id = lobbies[i].UUID
                    fetch('http://localhost:8080/message/getRoom/' + id)
                        .then((response) => {
                            return response.json()
                        })
                        .then((data) => {
                            if (data.currentPeopleCount != data.maxPeopleCount) {
                                enterLobby(id)
                            }
                        })
                }, true)
                x.style.fontSize = "20"
                document.getElementById("lobbies").appendChild(x)
                var lemon = document.getElementById('lobbies')
                lemon.scrollTop = lemon.scrollHeight
            }
        })
}

document.getElementById("game_start_button").addEventListener("click", (e) => {
    message['type'] = "game"
    console.log("game start method")
    console.log(message)
    fetch('http://localhost:8080/message/getRoom/' + id)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            if (data.currentPeopleCount >= data.minPeopleCount) {

                chatSocket.send(JSON.stringify(message))
                console.log("Game started")
                socket = new WebSocket("ws://localhost:8080/websocket")
                state = "online"
                socket.onopen = () => {
                    userInfo['sessionStatus'] = 'room game';
                    userInfo['userName'] = ourId
                    userInfo['userChoice'] = id
                    socket.send(JSON.stringify(userInfo));
                    console.log("Socket is open");
                }
                document.getElementById("rooms").style.display = "none"
                document.getElementById("room_page").style.display = "none"

                document.getElementById("form").style.display = "none"
                document.getElementById("waiting_page").style.display = "flex"
                document.getElementById("content_game").style.display = "block"

                document.getElementById("pScore").textContent = "Your score: "
                document.getElementById("game").scrollIntoView({ block: "center", behavior: "smooth" });

                socket.onmessage = (e) => {
                    console.log("Message received");
                    userInfo = JSON.parse(e.data);
                    if (userInfo['sessionStatus'] === "start") {
                        console.log("start message");
                        document.getElementById("waiting_page").style.display = "none"
                        document.getElementById("game").style.display = "block"
                        document.getElementById("cScore").textContent = userInfo.userName + ": "

                    }
                    if (userInfo['sessionStatus'] === "game") {
                        console.log("game message");
                        computerChoice = userInfo['userChoice'];
                        document.getElementById("animation1").style.animation = 'example .4s 1'
                        document.getElementById("animation2").style.animation = 'example .4s 1'
                    }
                    if (userInfo['sessionStatus'] === "terminate") {
                        console.log("terminate message");
                        alert("Your opponent left")
                        document.getElementById("waiting_page").style.display = "flex"
                        document.getElementById("pScore").textContent = "Your score: "
                        document.getElementById("game").scrollIntoView({ block: "center", behavior: "smooth" });
                        document.getElementById("game").style.display = "none"
                        document.getElementById("rounds_left").style.display = "none"
                        document.getElementById("pScore").style.display = "none"
                        document.getElementById("cScore").style.display = "none"
                        document.getElementById("final").style.display = "none"
                        document.getElementById("animation1").style.display = "none"
                        document.getElementById("animation2").style.display = "none"
                        document.getElementById("hands_and_btn").style.display = "none"
                        document.getElementById("repeat_button").style.display = "none"

                        document.getElementById("hands_and_btn").style.display = "block"
                        playerScore = 0
                        computerScore = 0
                        moves = 0
                    }
                }

                socket.onclose = () => {
                    console.log("Socket closed");
                }

            } else {
                alert("Shame on you, wait for other players!")
            }
        })
})

function enterLobby(id) {

    document.getElementById("rooms").style.display = "none"
    chatSocket = new WebSocket("ws://localhost:8080/chat")
    document.getElementById("game").style.display = "block"
    document.getElementById("content_game").style.display = "none"
    document.getElementById("game_start_button").style.display = "none"

    chatSocket.onopen = (e) => {
        message['userName'] = localStorage.getItem("userName")
        userName = localStorage.getItem("userName")
        message['type'] = "start"
        message['groupId'] = id
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
            fetch('http://localhost:8080/message/getHistory/' + data['groupId'])
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
        if (data['type'] === "game is started") {
            console.log("Game started")
            socket = new WebSocket("ws://localhost:8080/websocket")
            state = "online"
            socket.onopen = () => {
                userInfo['sessionStatus'] = 'room game';
                userInfo['userName'] = ourId
                userInfo['userChoice'] = id
                socket.send(JSON.stringify(userInfo));
                console.log("Socket is open");
            }
            document.getElementById("rooms").style.display = "none"
            document.getElementById("room_page").style.display = "none"

            document.getElementById("form").style.display = "none"
            document.getElementById("waiting_page").style.display = "flex"
            document.getElementById("content_game").style.display = "block"

            document.getElementById("pScore").textContent = "Your score: "
            document.getElementById("game").scrollIntoView({ block: "center", behavior: "smooth" })

            socket.onmessage = (e) => {
                console.log("Message received");
                userInfo = JSON.parse(e.data);
                if (userInfo['sessionStatus'] === "start") {
                    console.log("start message");
                    document.getElementById("waiting_page").style.display = "none"
                    document.getElementById("game").style.display = "block"
                    document.getElementById("cScore").textContent = userInfo.userName + ": "

                }
                if (userInfo['sessionStatus'] === "game") {
                    console.log("game message");
                    computerChoice = userInfo['userChoice'];
                    document.getElementById("animation1").style.animation = 'example .4s 1'
                    document.getElementById("animation2").style.animation = 'example .4s 1'
                }
                if (userInfo['sessionStatus'] === "terminate") {
                    alert("Your opponent left")
                    console.log("terminate message");
                    document.getElementById("waiting_page").style.display = "flex"
                    document.getElementById("pScore").textContent = "Your score: "
                    document.getElementById("game").scrollIntoView({ block: "center", behavior: "smooth" });
                    document.getElementById("game").style.display = "none"
                    document.getElementById("rounds_left").style.display = "none"
                    document.getElementById("pScore").style.display = "none"
                    document.getElementById("cScore").style.display = "none"
                    document.getElementById("final").style.display = "none"
                    document.getElementById("animation1").style.display = "none"
                    document.getElementById("animation2").style.display = "none"
                    document.getElementById("hands_and_btn").style.display = "none"
                    document.getElementById("repeat_button").style.display = "none"

                    document.getElementById("hands_and_btn").style.display = "block"
                    playerScore = 0
                    computerScore = 0
                    moves = 0
                }
            }

            socket.onclose = () => {
                console.log("Socket closed");
            }
        }
    }
}

document.getElementById("lobby_create_button").addEventListener("click", (e) => {
    document.getElementById("mode_choose").style.display = "none"
    document.getElementById("room_page").style.display = "flex"
    chatSocket = new WebSocket("ws://localhost:8080/chat")
    document.getElementById("game").style.display = "block"
    document.getElementById("content_game").style.display = "none"

    chatSocket.onopen = (e) => {
        message['userName'] = localStorage.getItem("userName")
        userName = localStorage.getItem("userName")
        message['type'] = "create room"
        message['userMessage'] = "2"
        message['userId'] = "2"

        chatSocket.send(JSON.stringify(message))
        console.log("Socket is open")
    }

    chatSocket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data['type'] === "start") {
            message = data
            ourId = message['userId']
            id = message['groupId']
            // userId = message['userId']
            console.log("Message type 'start'")
            fetch('http://localhost:8080/message/getHistory/' + data['groupId'])
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    for (var i = 0; i < data.length; i++) {
                        console.log(data[i])
                    }

                })
        }
        if (data['type'] === "message") {
            console.log(data)
            console.log("Message received")
            sendMessage(data)
        }
    }
})

document.getElementById("online_button").addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("waiting_page").style.display = "flex"
    document.getElementById("form").style.display = "none"
    document.getElementById("rooms").style.display = "none"
    document.getElementById("room_page").style.display = "none"
})

document.getElementById("offline_button").addEventListener("click", (e) => {

    e.preventDefault()

    userInfo['userName'] = "Computer";
    document.getElementById("form").style.display = "none"
    console.log("start offline");
    document.getElementById("pScore").textContent = "Your score: 0"
    document.getElementById("game").style.display = "block"
    document.getElementById("cScore").textContent = userInfo.userName + ": 0"

    document.getElementById("game").scrollIntoView({ block: "center", behavior: "smooth" });
}
)

function clearBtns() {
    document.getElementById("btn_paper_panel").style.background = "#e6e8da";
    document.getElementById("btn_rock_panel").style.background = "#e6e8da";
    document.getElementById("btn_scissors_panel").style.background = "#e6e8da";

    document.getElementById("btn_paper_panel").style.borderColor = "#8cd96b";
    document.getElementById("btn_rock_panel").style.borderColor = "#8cd96b";
    document.getElementById("btn_scissors_panel").style.borderColor = "#8cd96b";
}


document.getElementById("elem1").addEventListener("click", (e) => {
    e.preventDefault()
    clearBtns()
    playerChoice = 0
    document.getElementById("btn_paper_panel").style.background = "#8cd96b";
    document.getElementById("btn_paper_panel").style.borderColor = "#ffed2b"
    document.getElementById("game_button").style.display = "block"
    document.getElementById("game_button").scrollIntoView({ block: "center", behavior: "smooth" });
})

document.getElementById("elem2").addEventListener("click", (e) => {
    e.preventDefault()
    clearBtns()
    playerChoice = 1
    document.getElementById("btn_rock_panel").style.background = "#8cd96b";
    document.getElementById("btn_rock_panel").style.borderColor = "#ffed2b"
    document.getElementById("game_button").style.display = "block"
    document.getElementById("game_button").scrollIntoView({ block: "center", behavior: "smooth" });
})

document.getElementById("elem3").addEventListener("click", (e) => {
    e.preventDefault()
    clearBtns()
    playerChoice = 2
    document.getElementById("btn_scissors_panel").style.background = "#8cd96b";
    document.getElementById("btn_scissors_panel").style.borderColor = "#ffed2b"
    document.getElementById("game_button").style.display = "block"
    document.getElementById("game_button").scrollIntoView({ block: "center", behavior: "smooth" });
})


document.getElementById("game_button").addEventListener("click", (e) => {
    e.preventDefault()
    console.log("game_button event")
    document.getElementById("rounds_left").style.display = "flex"
    document.getElementById("pScore").style.display = "flex"
    document.getElementById("cScore").style.display = "flex"
    document.getElementById("final").style.display = "flex"
    document.getElementById("animation1").style.display = "block"
    document.getElementById("animation2").style.display = "block"
    document.getElementById("hands_and_btn").style.display = "none"
    document.getElementById("repeat_button").style.display = "none"

    var lefthand = document.getElementById("animation1")
    var righthand = document.getElementById("animation2")
    document.getElementById("left_hand").src = `./indexAssets/hands/leftWait.png`;
    document.getElementById("right_hand").src = `./indexAssets/hands/rightWait.png`;
    document.getElementById('result').textContent = "Wait...";
    var lefthand = document.getElementById("animation1")
    var righthand = document.getElementById("animation2")
    if (state === "offline") {
        lefthand.style.animation = 'example .4s 3'
        righthand.style.animation = 'example .4s 3'
    } else {
        lefthand.style.animation = 'example .4s infinite'
        righthand.style.animation = 'example .4s infinite'
    }

    document.getElementById("game").scrollIntoView({ block: "center", behavior: "smooth" });

})

document.getElementById("repeat_button").addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("final").style.display = "none"
    document.getElementById("animation1").style.display = "none"
    document.getElementById("animation2").style.display = "none"
    document.getElementById("hands_and_btn").style.display = "none"
    document.getElementById("repeat_button").style.display = "none"

    document.getElementById("hands_and_btn").style.display = "block"

})

document.getElementById("leave_button").addEventListener("click", (e) => {
    e.preventDefault()
    window.location.reload();
    window.location.href = '../start/start.html';
})

const game = () => {
    document.getElementById("animation1").addEventListener('animationend', function (e) {
        document.getElementById("left_hand").src = `./indexAssets/hands/${playerOptions[playerChoice]}Left.png`;
        document.getElementById("left_hand").style.transform = 'rotate(30deg)';
        document.getElementById("right_hand").src = `./indexAssets/hands/${computerChoice}Right.png`;
        document.getElementById("right_hand").style.transform = 'rotate(-30deg)';
        document.getElementById('bottom').scrollIntoView(true);

        winner(playerOptions[playerChoice], computerChoice)
        if (moves == 10) {
            gameOver(playerOptions);
        }
    });


    const playGame = () => {
        document.getElementById("game_button").addEventListener('click', function () {
            console.log("playerGame game_button event")

            const movesLeft = document.getElementById('rounds_left');
            moves++;
            movesLeft.textContent = `Rounds Left: ${10 - moves}`;
            if (state === "online") {
                userInfo['sessionStatus'] = 'game';
                userInfo['userChoice'] = playerOptions[playerChoice];
                socket.send(JSON.stringify(userInfo));
            } else {
                const choiceNumber = Math.floor(Math.random() * 3);
                computerChoice = computerOptions[choiceNumber];
            }
        })
    }

    const winner = (player, computer) => {
        const result = document.getElementById('result');
        const playerScoreBoard = document.getElementById('pScore');
        const opponentScoreBoard = document.getElementById('cScore');
        var resulString = ""


        if (player === computer) {
            resulString = 'Tie'
        }
        else if (player == 'rock') {
            if (computer == 'paper') {
                resulString = 'Opponent Won';
                computerScore++;
            } else {
                resulString = 'Player Won'
                playerScore++;
            }
        }
        else if (player == 'scissors') {
            if (computer == 'rock') {
                resulString = 'Opponent Won';
                computerScore++;
            } else {
                resulString = 'Player Won';
                playerScore++;
            }
        }
        else if (player == 'paper') {
            if (computer == 'scissors') {
                resulString = 'Opponent Won';
                computerScore++;
            } else {
                resulString = 'Player Won';
                playerScore++;
            }
        }
        if (moves != 10)
            result.textContent = resulString

        opponentScoreBoard.textContent = `${userInfo['userName']}: ${computerScore}`;
        playerScoreBoard.textContent = `Your score: ${playerScore}`;
        document.getElementById("repeat_button").style.display = "flex";

        document.getElementById('bottom').scrollIntoView({ block: "center", behavior: "smooth" });
    }


    const gameOver = (playerOptions) => {
        const result1 = document.getElementById("result");
        result1.style.display = "flex"
        if (playerScore > computerScore) {
            result1.innerText = 'You Won The Game'
            result1.style.color = '#308D46';
        }
        else if (playerScore < computerScore) {
            result1.innerText = 'You Lost The Game';
            result1.style.color = 'red';
        }
        else {
            result1.innerText = 'Tie';
        }
        document.getElementById("repeat_button").innerText = 'Restart';
        document.getElementById("repeat_button").addEventListener('click', () => {
            window.location.reload();
        })
    }


    // Calling playGame function inside game
    playGame();

}

// Calling the game function
game();

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
    // alert(localStorage.getItem("userName"))
    message['type'] = "message"

    Data = new Date()
    Hour = Data.getHours()
    Minutes = Data.getMinutes()
    Seconds = Data.getSeconds()
    // Вывод
    var utcDate = (Hour + ":" + Minutes + ":" + Seconds)

    message['data'] = utcDate
    // message[]
    chatSocket.send(JSON.stringify(message))
    //   socket.emit('message', message)
    return false
})