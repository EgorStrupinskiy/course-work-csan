var playerChoice = 0
const playerOptions = ['paper', 'rock', 'scissors'];
const computerOptions = ['paper', 'rock', 'scissors']
var computerChoice = 0
var state = "offline"
let moves = 0
let playerScore = 0
let computerScore = 0
let lobbies = [
    "Egor",
    "Max",
    "Andrei"
]


let userInfo = {
    userName: '',
    userChoice: '',
    sessionStatus: ''
}

var socket;

document.getElementById("name_button").addEventListener("click", (e) => {
    // if (document.getElementById("name").value === '') {
    //     alert("Please, enter the name");
    // } else {
    e.preventDefault()
    socket = new WebSocket("ws://localhost:8080/websocket")
    state = "online"
    socket.onopen = () => {
        userInfo['sessionStatus'] = 'start';
        // userInfo['userName'] = document.getElementById("name").value;
        userInfo['userName'] = localStorage.getItem("userName");

        socket.send(JSON.stringify(userInfo));
        console.log("Socket is open");
    }
    document.getElementById("form").style.display = "none"
    document.getElementById("waiting_page").style.display = "flex"
    document.getElementById("pScore").textContent = "Your score: "
    document.getElementById("game").scrollIntoView({ block: "center", behavior: "smooth" });
    for (let i = 0; i < lobbies.length; i++) {
        console.log(lobbies[i])
        var x = document.createElement("A")
        var t = document.createTextNode(lobbies[i])
        x.appendChild(t)
        x.setAttribute('href', '#');
        x.classList.add("lobby")
        
        x.style.fontSize = "20"
        document.getElementById("lobbies").appendChild(x)
        var lemon = document.getElementById('lobbies')
        lemon.scrollTop = lemon.scrollHeight
    }
    socket.onmessage = (e) => {
        console.log("Message received");
        userInfo = JSON.parse(e.data);
        if (userInfo['sessionStatus'] === "start") {
            console.log("start message");
            document.getElementById("waiting_page").style.display = "none"
            document.getElementById("game").style.display = "flex"
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

    //document.getElementById("form").style.display = "none"
    //document.getElementById("game").style.display = "flex"
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

})

const game = () => {
    document.getElementById("animation1").addEventListener('animationend', function (e) {
        document.getElementById("left_hand").src = `./indexAssets/hands/${playerOptions[playerChoice]}Left.png`;
        document.getElementById("left_hand").style.transform = 'rotate(30deg)';
        document.getElementById("right_hand").src = `./indexAssets/hands/${computerChoice}Right.png`;
        document.getElementById("right_hand").style.transform = 'rotate(-30deg)';
        // document.getElementById("repeat_button").scrollIntoView({block: "center", behavior: "smooth"});
        document.getElementById('bottom').scrollIntoView(true);

        winner(playerOptions[playerChoice], computerChoice)
        if (moves == 10) {
            gameOver(playerOptions);
        }
    });


    // Function to
    const playGame = () => {

        // Function to start playing game

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

            // Function to check who wins

            // Calling gameOver function after 10 moves



        })
    }



    // Function to decide winner

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
        // document.getElementById("result").style.display = "none"
        // document.getElementById("animation1").style.display = "none"
        // document.getElementById("animation2").style.display = "none"
        // document.getElementById("hands_and_btn").style.display = "none"
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

// var socket = io();

//alert('hello bobo');

document.getElementById("send_message_button").addEventListener("click", (e) => {
    Data = new Date();
    Hour = Data.getHours();
    Minutes = Data.getMinutes();
    Seconds = Data.getSeconds();
    if (document.getElementById("message").value === '') {
        return 0;
    }
    // Вывод
    var utcDate = (Hour + ":" + Minutes + ":" + Seconds);
    var text = document.getElementById("message").value;;
    var initials = localStorage.getItem("userName");
    var message = utcDate + " : " + initials + ': ' + text;

    var x = document.createElement("LI");
    var t = document.createTextNode(message);
    x.appendChild(t);
    x.style.color = "red";
    x.style.fontSize = "20";
    document.getElementById("history").appendChild(x);

    //   $('<li>').text(message).appendTo('#history');
    var lemon = document.getElementById('history');
    lemon.scrollTop = lemon.scrollHeight;
    document.getElementById("message").value = ""



    //   socket.emit('message', message);
    //   $('#message').val('');
    return false;
});

// socket.on('message', function (msg) {
//   $('<li>').text(msg).appendTo('#history');
//   var lemon = document.getElementById('history');
//   lemon.scrollTop = lemon.scrollHeight;
// });