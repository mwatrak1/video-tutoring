var ogloszenia = []
var lastClickedMessageButton = 0


let obecna_strona = 1;
let wiersz = 5;
const element_list = document.getElementById('wyswietlOgloszenia')
const element_paginacji = document.getElementById('pagination1');

var ilosc = 0;

function WypelnijListe() {
  fetch('/ogloszenia')
    .then(response => response.json())
    .then(data => {
      ogloszenia = data
      if (ogloszenia.length > 0) {
        console.log(ogloszenia);
        renderOgloszenia(ogloszenia, element_list, wiersz, obecna_strona)
        ZainstalujListe(ogloszenia, element_paginacji, wiersz);
      }
    })
}


function getClickedButton(clickedButton) {
  lastClickedMessageButton = clickedButton.value
}

function wyslijWiadomosc() {

  var trescWiadomosci = document.getElementById('tekstWiadomosci').value

  if (trescWiadomosci.length > 1) {

    fetch('/nowaWiadomosc', {
      method: "POST",
      body: JSON.stringify({ odbiorcaId: lastClickedMessageButton, trescWiadomosci: trescWiadomosci }),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(response => response.json())
      .then(data => {
        console.log('Success : ', data)
        var newElement = document.createElement('p');
        newElement.innerHTML = 'Wiadomosc wyslana pomyslnie'
        document.getElementById('modalBody').insertAdjacentElement('beforeend', newElement)
      })
      .catch(error => {
        console.error('Failure : ', error)
        var newElement = document.createElement('p');
        newElement.innerHTML = 'Wiadomosc nie zostala wyslana'
        document.getElementById('modalBody').insertAdjacentElement('beforeend', newElement)
      })

  }

}


$('#wyszukajPoStringu').on('click', event => {
  var searchQuery = document.getElementById('wyszukiwarka').value


  var filterName = ogloszenia.filter(el => kmpSearch(searchQuery, el.imie) != -1)
  var filterLanguage = ogloszenia.filter(el => kmpSearch(searchQuery, el.jezyk) != -1)

  result = filterName.length > filterLanguage.length

  cleanOgloszenia()

  if (filterName.length > filterLanguage.length) {
    ZainstalujListe(filterName, element_paginacji, wiersz);
    renderOgloszenia(filterName, element_list, wiersz, obecna_strona)

  } else {
    ZainstalujListe(filterLanguage, element_paginacji, wiersz);
    renderOgloszenia(filterLanguage, element_list, wiersz, obecna_strona)
  }

})


$('#sortujPoCenieRosnaco').on('click', event => {
  console.log('Klik')
  var posortowane = [...ogloszenia].sort(((el1, el2) => el1.cena > el2.cena))
  cleanOgloszenia()
  ZainstalujListe(posortowane, element_paginacji, wiersz);
  renderOgloszenia(posortowane, element_list, wiersz, obecna_strona)

})


$('#sortujPoCenieMalejaco').on('click', event => {
  console.log('Klik')
  var posortowane = [...ogloszenia].sort(((el1, el2) => el1.cena < el2.cena))
  cleanOgloszenia()
  ZainstalujListe(posortowane, element_paginacji, wiersz);
  renderOgloszenia(posortowane, element_list, wiersz, obecna_strona)

})


function cleanOgloszenia() {
  document.getElementById('wyswietlOgloszenia').innerHTML = '';
}

async function renderOgloszenia(wszystkieOgloszenia, wrapper, wiersz_na_strone, strona) {
  wrapper.innerHTML = "";
  strona--;
  let start = wiersz_na_strone * strona;
  let end = start + wiersz_na_strone;
  let paginatedItems = wszystkieOgloszenia.slice(start, end);

  for (let i = 0; i < paginatedItems.length; i++) {
    var zdjecie = await checkZdjecie(paginatedItems[i].zdjecie)
    var srednia = await checkSrednia(paginatedItems[i].srednia)

    var native = paginatedItems[i].jezyk == paginatedItems[i].ojczysty ? true : false

    var element = await makeOgloszenie(paginatedItems[i].imie, paginatedItems[i].opis, paginatedItems[i].jezyk, paginatedItems[i].cena, paginatedItems[i].id, paginatedItems[i].idogloszenia, srednia, zdjecie, native)
    document.getElementById('wyswietlOgloszenia').insertAdjacentHTML('beforeend', element)
    ilosc++;

  }
  return true
}

async function checkSrednia(srednia) {
  if (srednia == null) {
    return ''
  } else {
    return "Opinia: " + srednia
  }

}

async function checkZdjecie(zdjecie) {
  if (zdjecie == null) {
    return "https://inzynierkanativespeakerzy.s3.eu-central-1.amazonaws.com/doge.jpg"
  } else {
    return "https://inzynierkanativespeakerzy.s3.eu-central-1.amazonaws.com/" + zdjecie
  }

}


async function makeOgloszenie(imie, opis, jezyk, cena, iduzytkownika, idogloszenia, opinia, zdjecie, nativespeakerstatus) {

  var nativespeakerElement = ``

  if (nativespeakerstatus == true) {
    nativespeakerElement = `
    <div class="cont" style="margin-left: 1%;">
      Native speaker
      <span class="badge badge-secondary"
        ><i class="fas fa-check"></i
      ></span>
    </div>`
  }

  opis = opis.substring(0, 70) + "..."

  return `<a
class="list-group-item list-group-item-action flex-column align-items-start obramowanie"
style="background-color: #fdfeff; color: #2b0404;"
>
<div class="row">
  <div class="col-sm-1 ogloszenia-zdjecie">
    <img
      src="` + zdjecie + `"
      class="pull-left photo"
      style="border-radius: 50%; margin-right: 10px; width: 80px; height: 80px"
    />
  </div>
  <div class="col-sm-4 ogloszenia-tekst">
    <h5 style="margin-left: 2%;">` + imie + `</h5>
    <div class="sprawdz" style="margin-left: 2%;">` + opis +
    `</div>` + nativespeakerElement + `</div>
  <div class="col-sm-4 ogloszenia-tekst">
    Jezyk : ` + jezyk + `<br />
    Cena : ` + cena + `/godz.<br />`
    + opinia.substring(0, 12) + `<br/>
  </div>
  <div class="col-sm-3 ogloszenia-przyciski">
    <button type="button" value="`+ iduzytkownika + `" onclick="getClickedButton(this)" data-toggle="modal" data-target="#sendNewMessage" style="width:75%;" class="btn btn-primary btn-info btn-more">
      Wyślij wiadomość &nbsp;
      <i class="fas fa-envelope" aria-hidden="true"></i>
    </button>
    <br /><br />
    <button type="button" onclick="window.location.href = '/ogloszenie/`+ idogloszenia + `';" class="btn btn-success btn-more" style="width:75%;">
      Zobacz &nbsp;
      <i class="fa fa-chevron-circle-right" aria-hidden="true"></i>
    </button>
  </div>
</div>
</a>`
}



function ZainstalujListe(przedmioty, wrapper, wiersz_na_strone) {
  wrapper.innerHTML = "";
  let page_count = Math.ceil(przedmioty.length / wiersz_na_strone);
  for (let i = 1; i < page_count + 1; i++) {
    let btn = PrzyciskPaginacji(i, przedmioty);
    wrapper.appendChild(btn);
  }

}



function PrzyciskPaginacji(strona, przedmioty) {
  let przycisk = document.createElement('button');
  przycisk.innerText = strona;
  if (obecna_strona == strona) {
    przycisk.classList.add('active');
  }
  przycisk.addEventListener('click', function () {
    obecna_strona = strona;
    cleanOgloszenia();
    renderOgloszenia(przedmioty, element_list, wiersz, obecna_strona);
    let current_btn = document.querySelector('.pagenumbers button.active');
    current_btn.classList.remove('active');
    this.classList.remove('active');
    przycisk.classList.add('active');
  })
  return przycisk;
}

function kmpSearch(wzorDoPorownania, tekst) {

  if (wzorDoPorownania.length == 0)
    return 0

  var lsp = [0]
  for (var i = 1; i < wzorDoPorownania.length; i++) {
    var j = lsp[i - 1]
    while (j > 0 && wzorDoPorownania.charAt(i) != wzorDoPorownania.charAt(j))
      j = lsp[j - 1]
    if (wzorDoPorownania.charAt(i) == wzorDoPorownania.charAt(j))
      j++
    lsp.push(j)
  }

  var j = 0;
  for (var i = 0; i < tekst.length; i++) {
    while (j > 0 && tekst.charAt(i) != wzorDoPorownania.charAt(j))
      j = lsp[j - 1]
    if (tekst.charAt(i) == wzorDoPorownania.charAt(j)) {
      j++
      if (j == wzorDoPorownania.length)
        return i - (j - 1)
    }
  }

  return -1
}

WypelnijListe();