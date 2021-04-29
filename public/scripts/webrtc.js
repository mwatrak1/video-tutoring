let divWybierzPokoj = document.getElementById("wybierzPokoj")
let divPoczekalnia = document.getElementById("poczekalnia")
let wpiszNumerPokoju = document.getElementById("numerPokoju")
let przyciskIdzDoPokoju = document.getElementById("idzDoPokoju")
let lokalneVideo = document.getElementById("lokalneVideo")
let zdalneVideo = document.getElementById("zdalneVideo")
let Imie = document.getElementById("Imie")
let wpiszImie = document.getElementById("wpiszImie")
let przyciskUstawImie = document.getElementById("ustawImie")
var mikrofon = document.getElementById("mikrofon")
var ekran = document.getElementById("ekran")

var mic_przelacznik = true;
var vid_przelacznik = true;

let numerPokoju, lokalnyStrumyk, zdalnyStrumyk, polaczenieKlienta, ktoDzwoni, kanalDanych

const iceServers = {
    'iceServers': [
        {'urls': 'stun:3.127.70.44:3478'
},
	{'urls': 'turn:3.127.70.44:3478?transport=udp',
	'credential': 'user',
	'username': 'user'},
	  {'urls': 'turn:3.127.70.44:3478?transport=tcp',
        'credential': 'user',
        'username': 'user'}


    ]
}

function clickButton() { 
    document.querySelector('#idzDoPokoju').click(); 
} 
setTimeout(clickButton, 100); 

const Ograniczenia = {
    audio: true,
    video: {
        width: {
            min: 1280,
            ideal: 1920,
            max: 1920
        },
        height: {
            min: 720,
            ideal: 1080,
            max: 1080
        },
        aspectRatio: { ideal: 1.7777777778 }
    }
}

const socket = io()

przyciskIdzDoPokoju.onclick = () => {
    if (wpiszNumerPokoju.value === ''){
        alert("Wprowadz pokoj")
    } else {
        numerPokoju = wpiszNumerPokoju.value
        socket.emit('Stwórz albo dołącz', numerPokoju)
        divWybierzPokoj.style = "display:none"
        divPoczekalnia.style = "display:block"
    }
}

przyciskUstawImie.onclick = () => {
    if (wpiszImie.value === ''){
        alert("Prosze wprowadz imie")
    } else {
        kanalDanych.send(wpiszImie.value)
        Imie.innerText = wpiszImie.value
    }
}


socket.on('stworzono', room =>{
    navigator.mediaDevices.getUserMedia(Ograniczenia)
    .then(stream => {
        lokalnyStrumyk = stream
        lokalneVideo.srcObject = stream
        ktoDzwoni = true
    })
    .catch(err => {
        console.log('Błąd: ', err)
    })
})

socket.on('dolaczono', room =>{
    navigator.mediaDevices.getUserMedia(Ograniczenia)
    .then(stream => {
        lokalnyStrumyk = stream
        lokalneVideo.srcObject = stream
        socket.emit('przygotowano', numerPokoju)
    })
    .catch(err => {
        console.log('Błąd: ', err)
    })
})

socket.on('przygotowano', () => {
    console.log("Przygotowany: ",ktoDzwoni)
    if (ktoDzwoni){
        polaczenieKlienta = new RTCPeerConnection(iceServers)
        polaczenieKlienta.onicecandidate = iceCandidate
        polaczenieKlienta.ontrack = dodajStrumyk
        polaczenieKlienta.addTrack(lokalnyStrumyk.getTracks()[0], lokalnyStrumyk)
        polaczenieKlienta.addTrack(lokalnyStrumyk.getTracks()[1], lokalnyStrumyk)
        polaczenieKlienta.createOffer()
        .then(sessionDescription => {
            console.log("Przesłanie oferty: ", sessionDescription)
            polaczenieKlienta.setLocalDescription(sessionDescription)
            socket.emit('oferta', {
                type: 'oferta',
                sdp: sessionDescription,
                room: numerPokoju
            })
        })
        .catch(err => {
            console.log(err)
        })

        kanalDanych = polaczenieKlienta.createDataChannel(numerPokoju)
        kanalDanych.onmessage = event => {Imie.innerText = event.data}
    }
})


socket.on('oferta', (event) => {
    console.log("Oferta: ", ktoDzwoni)
    if (!ktoDzwoni){
        polaczenieKlienta = new RTCPeerConnection(iceServers)
        polaczenieKlienta.onicecandidate = iceCandidate
        polaczenieKlienta.ontrack = dodajStrumyk
        polaczenieKlienta.addTrack(lokalnyStrumyk.getTracks()[0], lokalnyStrumyk)
        polaczenieKlienta.addTrack(lokalnyStrumyk.getTracks()[1], lokalnyStrumyk)
        console.log("Otrzymano oferte", event)
        polaczenieKlienta.setRemoteDescription(new RTCSessionDescription(event))
        polaczenieKlienta.createAnswer()
        .then(sessionDescription => {
            console.log("Wysłanie odpowiedzi", sessionDescription)
            polaczenieKlienta.setLocalDescription(sessionDescription)
            socket.emit('odpowiedz', {
                type: 'oferta',
                sdp: sessionDescription,
                room: numerPokoju
            })
        })
        .catch(err => {
            console.log(err)
        })

        polaczenieKlienta.ondatachannel = event => {
            kanalDanych = event.channel
            kanalDanych.onmessage = event => {Imie.innerText = event.data}
        }
    }
})

socket.on('odpowiedz', event => {
    console.log("Otrzymano odpowiedz:", event)
    polaczenieKlienta.setRemoteDescription(new RTCSessionDescription(event))
})

socket.on('candidate', event => {
	console.log("Kandydat zdarzenie: ", event);
    const candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    })
    console.log("Otrzymano kandydata: ", candidate)
    polaczenieKlienta.addIceCandidate(candidate)
})

function dodajStrumyk(event){
    zdalneVideo.srcObject = event.streams[0]
    zdalnyStrumyk = event.streams[0]
}

function iceCandidate(event){
	console.log("funkcja: ", event)
    if (event.candidate){
        console.log("Wysyłanie kandydata", event.candidate)
        socket.emit('candidate', {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            room: numerPokoju
        })
    }
}

function zamknij() {
    if(lokalnyStrumyk != null && lokalnyStrumyk.getVideoTracks().length > 0){
      vid_przelacznik = !vid_przelacznik;
      console.log("Tutaj jestem video");
      lokalnyStrumyk.getVideoTracks()[0].enabled = vid_przelacznik;
      console.log("Klasa: ",ekran.className)
      ekran.removeClass("fas fa-video");
      ekran.addClass("fas fa-video-slash")
      console.log("Po video");
      console.log("Klasa po:",ekran.className)
    }
  
  }
  
  function wycisz() {
    if(lokalnyStrumyk != null && lokalnyStrumyk.getAudioTracks().length > 0){
      mic_przelacznik = !mic_przelacznik;
      console.log("Tutaj jestem mikrofon");
      lokalnyStrumyk.getAudioTracks()[0].enabled = mic_przelacznik;
      mikrofon.removeClass("fas fa-microphone");
      mikrofon.addClass("fas fa-microphone-slash")
      console.log("Po mikrofonie");
    }   
    
} 