console.log("Haha");
function dodajPost(){

    var idtematu=document.getElementById("idtematu").getAttribute("value");
    var content=document.getElementById("answer").value;
    console.log("idtematu:",idtematu);
    console.log("content:",content);
    fetch('/dodajOdpowiedz', {
        method : "POST",
        body : JSON.stringify({idtematu: idtematu, tresc: content}),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json())
      .then(data => {
          console.log('Success : ', data)
          
      })
      .catch(error =>{
          console.error('Failure : ',error)
      })
} 