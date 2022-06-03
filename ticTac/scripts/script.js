var playerChoice = 0
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
    fetch('http://arcade-game-center.herokuapp.com/message/getAllRooms')
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
                    fetch('http://arcade-game-center.herokuapp.com/message/getRoom/' + id)
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
    fetch('http://arcade-game-center.herokuapp.com/message/getRoom/' + id)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            if (data.currentPeopleCount >= data.minPeopleCount) {

                chatSocket.send(JSON.stringify(message))
                console.log("Game started")
                socket = new WebSocket("ws://arcade-game-center.herokuapp.com/TTTWebSocket")
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
                        currentPlayer = userInfo['userChoice']
                        opponent = currentPlayer === "x" ? "O" : "X";
                        document.getElementById("waiting_page").style.display = "none"
                        document.getElementById("game").style.display = "block"
                        document.getElementById("cScore").textContent = userInfo.userName + ": "
                        game()
                    }
                    if (userInfo['sessionStatus'] === "game") {
                        console.log("game message");
                        getopponentChoice(userInfo['userChoice'])
                        computerChoice = userInfo['userChoice'];
                    }
                    if (userInfo['sessionStatus'] === "terminate") {
                        console.log("terminate message");
                        alert("Your opponent left")
                        window.location.reload();
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
    chatSocket = new WebSocket("ws://arcade-game-center.herokuapp.com/chat")
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
        if (data['type'] === "game is started") {
            console.log("Game started")
            socket = new WebSocket("ws://arcade-game-center.herokuapp.com/TTTWebSocket")
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
                    currentPlayer = userInfo['userChoice']
                    opponent = currentPlayer === "x" ? "O" : "X";
                    document.getElementById("waiting_page").style.display = "none"
                    document.getElementById("game").style.display = "block"
                    document.getElementById("cScore").textContent = userInfo.userName + ": "
                    game()
                }
                if (userInfo['sessionStatus'] === "game") {
                    console.log("game message");
                    getopponentChoice(userInfo['userChoice'])
                    computerChoice = userInfo['userChoice'];
                }
                if (userInfo['sessionStatus'] === "terminate") {
                    alert("Your opponent left")
                    window.location.reload();
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
    chatSocket = new WebSocket("ws://arcade-game-center.herokuapp.com/chat")
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
            fetch('http://arcade-game-center.herokuapp.com/message/getHistory/' + data['groupId'])
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

document.getElementById("leave_button").addEventListener("click", (e) => {
    e.preventDefault()
    window.location.reload();
    window.location.href = '../start/start.html';
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
    var utcDate = (Hour + ":" + Minutes + ":" + Seconds)

    message['data'] = utcDate
    chatSocket.send(JSON.stringify(message))
    return false
})

const statusDisplay = document.querySelector('.game--status');

let gameActive = true;
let turn = "X"
let currentPlayer;
let opponent;
let gameState = ["", "", "", "", "", "", "", "", ""];

let winningMessage
const drawMessage = () => `Game ended in a draw!`;

function game() {

    if (turn === opponent) {
        statusDisplay.innerHTML = "Wait for your opponent"
    } else {
        statusDisplay.innerHTML = "Your turn"
    }
}

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
}

function getopponentChoice(index) {
    let cells = document.getElementsByClassName("cell")
    gameState[index] = opponent
    cells[index].innerHTML = opponent
    handleResultValidation();
}

function handlePlayerChange() {
    turn = turn === "X" ? "O" : "X";
    if (turn === opponent) {
        statusDisplay.innerHTML = "Wait for your opponent"
    } else {
        statusDisplay.innerHTML = "Your turn"
    }
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break
        }
    }
    // alert(turn + " " + currentPlayer)

    if (roundWon) {
        if (turn === currentPlayer.toUpperCase()) {
            statusDisplay.innerHTML = `Player ${localStorage.getItem("userName")} has won!`;
        } else {
            statusDisplay.innerHTML = `Player ${userInfo['userName']} has won!`;
        }
        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = `Draw!`;
        gameActive = false;
        return;
    }

    handlePlayerChange();
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive || opponent == turn) {
        return;
    } else {
        console.log("playerGame game_button event")
        userInfo['sessionStatus'] = 'game';
        userInfo['userChoice'] = clickedCellIndex;
        socket.send(JSON.stringify(userInfo));
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = "");
}


document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.game--restart').addEventListener('click', handleRestartGame);

