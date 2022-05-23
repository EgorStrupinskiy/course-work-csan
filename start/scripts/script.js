document.getElementById("name_button").addEventListener("click", (e) => {
    if (document.getElementById("name").value === '') {
        alert("Please, enter the name");
    } else {
        e.preventDefault();
        document.getElementById("formName").style.display = "none";
        document.getElementById("formGames").style.display = "flex";
        var name = document.getElementById("name").value;
        localStorage.setItem('userName', name);

        document.getElementById("chat").style.display = "block";
    }
})

document.getElementById("formGames").style.display = "none";
document.getElementById("leave_button").addEventListener("click", (e) => {
    e.preventDefault()
    window.location.reload();
})

// var socket = io();

//alert('hello bobo');

document.getElementById("send_message_button").addEventListener("click", (e) => {
    Data = new Date()
    Hour = Data.getHours()
    Minutes = Data.getMinutes()
    Seconds = Data.getSeconds()
    if (document.getElementById("message").value === '') {
        return 0;
    }
    // Вывод
    var utcDate = (Hour + ":" + Minutes + ":" + Seconds)
    var text = document.getElementById("message").value
    var initials = localStorage.getItem("userName");
    var message = utcDate + " : " + initials + ': ' + text

    var x = document.createElement("LI")
    var t = document.createTextNode(message)
    x.appendChild(t)
    x.style.color = "red"
    x.style.fontSize = "20"
    document.getElementById("history").appendChild(x)

    //   $('<li>').text(message).appendTo('#history');
    var lemon = document.getElementById('history')
    lemon.scrollTop = lemon.scrollHeight
    document.getElementById("message").value = ""


    //   socket.emit('message', message);
    //   $('#message').val('');
    return false;
});