//1. Zarezerwuj zajecia
//2. Usun ta dostepnosc z bazy
//3. Wyswietl wiadomosc z informacja o rezerwacji
//4. Od nowa zrenderuj harmonogram bez zarezerwowanego terminu
//6 . Nie pozwalaj na rezerwajce niezalogowanym uzytkownikom - wyswietl info prosze sie zarejestrowac 

var ostatniWybranyHarmonogramId = ""
var startDostepnosci = ""
var koniecDostepnosci = ""

function rezerwacja(){
    var wybranyTerminIndex = document.getElementById("godziny_zajec").selectedIndex
    var wybranyWiersz = document.getElementById("termin_" + wybranyTerminIndex)
    var wybranyTermin = dayjs(wybranyWiersz.value, "YYYY-MM-DD HH:mm:ss")
    var czas_zajec = document.getElementById("czas_wybranych_zajec").value
    var nauczycielId = document.getElementById("id_nauczyciela").value
    var harmonogramId = document.getElementById("idharmonogram").value

    console.log(startDostepnosci, koniecDostepnosci)

    fetch('/rezerwujZajecia', {
        method: "POST",
        body: JSON.stringify({data_zajec: wybranyTermin.format("YYYY-MM-DD HH:mm:ss"), 
        czas_zajec: czas_zajec, idnauczyciel: nauczycielId, idharmonogram: harmonogramId, 
        poczatekDostepnosci: startDostepnosci.format("YYYY-MM-DD HH:mm:ss"),
         koniecDostepnosci: koniecDostepnosci.format("YYYY-MM-DD HH:mm:ss") }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(responseData => {
        console.log(responseData)
        var zamknijOknoRezerwacji = document.getElementById("zamknijModal")
        var rezerwacjaResult = document.getElementById("rezerwacjaResult")
        rezerwacjaResult.innerText = "Dokonano rezerwacji!"

    })
    .catch(error => {
        console.log("Error podczas rezerwacji: ", error)
    })
}

function renderujTerminy(zajecia){

    
    const wybranyTerminId = zajecia.getAttribute("value")
    const wybranyTerminWiersz = document.getElementById(wybranyTerminId).cells
    
    console.log(wybranyTerminWiersz)

    startDostepnosci = dayjs(wybranyTerminWiersz[0].innerText + wybranyTerminWiersz[1].innerText, "YYYY-MM-DD HH:mm:ss")
    koniecDostepnosci = dayjs(wybranyTerminWiersz[0].innerText + wybranyTerminWiersz[2].innerText, "YYYY-MM-DD HH:mm:ss")
    var czasZajec = wybranyTerminWiersz[3].innerText

    var dostepnoscMin = koniecDostepnosci.diff(startDostepnosci, 'minute')
    var dostepnaLiczbaZajec = Math.floor(dostepnoscMin / parseInt(czasZajec))
    
    var data = dayjs(wybranyTerminWiersz[0].innerText + wybranyTerminWiersz[1].innerText, "YYYY-MM-DD HH:mm:ss")
    var opcjeZajecDiv = document.getElementById("godziny_zajec")

    opcjeZajecDiv.innerHTML = ""

    for (let i=0; i< dostepnaLiczbaZajec; i++){
        var newOption = document.createElement("option")

        newOption.innerText = data.format("YYYY-MM-DD HH:mm:ss")

        newOption.setAttribute("id", "termin_" + i)

        
        opcjeZajecDiv.insertAdjacentElement("beforeend", newOption )

        data = data.add(parseInt(czasZajec), "minute")

    }

    var czas_wybranych_zajec = document.getElementById("czas_wybranych_zajec")
    czas_wybranych_zajec.setAttribute("value", czasZajec)
    var idHarmonogram = document.getElementById("idharmonogram")
    idHarmonogram.setAttribute("value", wybranyTerminId)

}