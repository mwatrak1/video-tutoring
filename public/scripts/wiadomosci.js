
var odswiezanie = window.setInterval(odswiezWiadomosci, 1000);

function odswiezWiadomosci(){
    const activeConversationExists = $("a[id$='list'][class$='active']")
    if (activeConversationExists.length > 0){
    var activeConversation =  activeConversationExists.attr('aria-controls').split('-')
    } else {
        return undefined
    }
    
    const conversationContent = document.getElementById('list-' + activeConversation[0] +"-"+ activeConversation[1])
    const contactId = activeConversation[2]

    fetch('/konwersacje/' +contactId)
                .then(response => response.json())
                .then(messageData =>{
                    console.log(messageData)
                    conversationContent.innerHTML = ''

                    messageData.forEach(message=>{
                        if (message.imie == activeConversation[0]){
                            var newMessage = renderContactsMessage(message.imie, message.nazwisko, message.tresc)
                        } else {
                            var newMessage = renderUsersMessage(message.imie, message.nazwisko, message.tresc)
                        }
                        conversationContent.insertAdjacentHTML('beforeend', newMessage)
            
                     })

                })
                .catch(error => {
                    console.log(error)
                })

}

function scrollToBottom(){
    setTimeout(()=>{
        var maxScrollHeight = document.getElementById('nav-tabContent').scrollTopMax
        console.log(maxScrollHeight)
        document.getElementById('nav-tabContent').scrollTop = maxScrollHeight
    }, 1000)
}

$('#wyslijWiadomosc').on('click', (event)=> {
    const messageText = document.getElementById('trescWiadomosci').value
    const activeConversation = $("a[id$='list'][class$='active']")
    const messageReceiver = (activeConversation).attr('aria-controls')
    const receiverData = messageReceiver.split('-')
    const receiverId = receiverData[2]
    

    fetch('/nowaWiadomosc', {
        method : "POST",
        body : JSON.stringify({odbiorcaId: receiverId, trescWiadomosci: messageText}),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json())
      .then(data => {
          console.log('Success : ', data)
          scrollToBottom()

      })
      .catch(error =>{
          console.error('Failure : ',error)
      })
})

function fetchAndRenderChat(){
    fetch('/kontakty')
        .then(response => response.json())
        .then(data => {
            const placeToAppendContacts = document.querySelector('#list-tab')
            data.forEach(contact => {
                console.log(contact)
                var newElement = renderContact(contact.imie, contact.nazwisko, contact.uzytkownik_iduzytkownik)
                placeToAppendContacts.insertAdjacentHTML('beforeend', newElement)

                fetch('/konwersacje/' +contact.uzytkownik_iduzytkownik)
                .then(response => response.json())
                .then(messageData =>{
                    console.log(messageData)
                    const placeToAppendContent = document.querySelector('#nav-tabContent')
                    var newContact = renderContactInfo(contact.imie, contact.nazwisko)
                    placeToAppendContent.insertAdjacentHTML('beforeend', newContact)

                    placeToAppendMessages = document.querySelector('#list-' + contact.imie + '-' + contact.nazwisko)
                    messageData.forEach(message=>{
                        if (message.imie == contact.imie){
                            var newMessage = renderContactsMessage(message.imie, message.nazwisko, message.tresc)
                        } else {
                            var newMessage = renderUsersMessage(message.imie, message.nazwisko, message.tresc)
                        }
                        
                        placeToAppendMessages.insertAdjacentHTML('beforeend', newMessage)
            
                     })

                })

            })
        
        })
        
        
}

fetchAndRenderChat()



function renderContact(imie, nazwisko, id){
    return `<a 
        class="list-group-item list-group-item-action wiadomosci-kontakty" 
        id="list-` +imie + `-` +nazwisko+`-list"`+` 
        data-toggle="list" 
        href="#list-`+imie+`-`+ nazwisko+`"
        onclick="scrollToBottom()" 
        role="tab" 
        style="text-align:center;"
        aria-controls="`+imie + `-` + nazwisko+`-` + id + `">` +
        imie + ` ` + nazwisko + `
    </a>`
}

function renderContactInfo(imie, nazwisko){
    return `<div class="tab-pane fade show "
     id="list-`+imie+`-`+ nazwisko+`" 
     role="tabpanel" 
     aria-labelledby="`+imie + `-` + nazwisko+`">` + `</div>`
}


function renderContactsMessage(imie, nazwisko, tresc){
    return `<p class="message">`+ imie + ' ' + nazwisko + `: ` + tresc + `</p></br>`
}

function renderUsersMessage(imie, nazwisko, tresc){
    return `<p class="message message-rigth">`+ imie + ' ' + nazwisko + `: ` + tresc + `</p></br>`
}
