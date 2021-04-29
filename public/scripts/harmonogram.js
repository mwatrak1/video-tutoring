

window.onload = () => {
    renderHarmonogram()
}

function renderHarmonogram(){
    fetch('/harmonogram/0')
    .then(res => res.json())
    .then(dostepneDni => {
        var placeToAppendRows = document.getElementById('harmonogram')
        dostepneDni.forEach(dzien => {
            console.log(dzien)
            var nowy_rekord = renderRow(dzien.idharmonogram, dzien.dostepne_dni, dzien.godzina_od, dzien.godzina_do, dzien.czas_trwania_zajec)
            placeToAppendRows.insertAdjacentHTML('beforeend', nowy_rekord)
        })
    })
}


function addAvalibility(element){


    const dzienZajec = document.getElementById('dzien').value
    const godzinaOd = document.getElementById('godzinaOd').value
    const godzinaDo = document.getElementById('godzinaDo').value
    const czasTrwania = document.getElementById('czasTrwania').value

    var poczatekDayjs = dayjs(dzienZajec + godzinaDo, "YYYY-MM-DD HH:mm")
    var koniecDayjs = dayjs(dzienZajec + godzinaOd, "YYYY-MM-DD HH:mm")
    var liczbaCalkowitychZajec = poczatekDayjs.diff(koniecDayjs, "minute")


    if (liczbaCalkowitychZajec % czasTrwania == 0 && czasTrwania >= 30 && dayjs().isBefore(poczatekDayjs)){
        fetch('/dodajDostepnoscHarmonogramu', {
            method : "POST",
            body : JSON.stringify({dzien: dzienZajec, godzina_poczatek: godzinaOd, godzina_koniec: godzinaDo, czas_trwania: czasTrwania}),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json())
        .then(data => {
            console.log(data)
            clearHarmonogram()
            renderHarmonogram()


        })
        .catch(error =>{
            console.error('Failure : ',error)
        })
    } else {
        messageElementDiv = document.getElementById("message")
        messageElementDiv.innerText = "Godziny zajec muszą pozwalać na rezerwacje całkowitej ilości zajęć a zajęcia muszą trwać przynajmniej 30 minut"
        setTimeout(() =>{
            messageElementDiv.innerText = ""
        }, 6000)
    }

}

function usunDostepnosc(clicked){
    var wierszeDoUsuniecia = $( "input[type=checkbox]:checked" )
    
    if (wierszeDoUsuniecia.length > 0){
        
        [...wierszeDoUsuniecia].forEach(row => {
            fetch('/usunDostepnoscHarmonogramu', {
                method: "POST",
                body: JSON.stringify({idharmonogram: row.id}),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
            })
            .catch(error => {
                console.error(error)
            })

        })
        
        clearHarmonogram()
        renderHarmonogram()
    }

}


function renderRow(idharmonogram, data, czas_od, czas_do, czas_trwania){
    console.log(data)
    data = data.slice(0,10)
    czas_od = czas_od.slice(0,5)
    czas_do = czas_do.slice(0,5)
    return `<tr class="wiersz">
                <td><input type="checkbox" id="`+idharmonogram+`"></td>
                <td>`+data+`</td>
                <td>`+czas_od+`</td>
                <td>`+czas_do+`</td>
                <td>`+czas_trwania+`</td>
            </tr>`
}

function clearHarmonogram(){
    var placeToAppendRows = document.getElementById('harmonogram')
          placeToAppendRows.innerHTML = `<tr>
          <th>Lp.</th>
          <th>Dostępna data</th>
          <th>Godzina od</th>
          <th>Godzina do</th>
          <th>Czas trwania zajęć</th>
        </tr>`;
}