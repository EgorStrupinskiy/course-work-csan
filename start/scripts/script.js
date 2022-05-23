document.getElementById("name_button").addEventListener("click", (e) => { 
    e.preventDefault();
    document.getElementById("formName").style.display = "none";
    document.getElementById("formGames").style.display = "flex";
    var name = document.getElementById("name").value;
    localStorage.setItem('userName', name);
})

document.getElementById("formGames").style.display = "none";
document.getElementById("leave_button").addEventListener("click", (e) => {
    e.preventDefault()
    window.location.reload();
})