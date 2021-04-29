var list_items = [
    
]
const element_listy = document.getElementById('list');
const element_paginacji = document.getElementById('pagination');

let obecna_strona=1;
let wiersz=5;
function wypelnijListe(){
    var idtematu=document.getElementById('idTematu').getAttribute("value");
    fetch('/listaPrzewijana/'+idtematu)
    .then(response=>response.json())
    .then(data => {
        console.log('Success : ', data)
        list_items=data;
        pokazListe(list_items, element_listy, wiersz, obecna_strona);
        ZainstalujListe(list_items, element_paginacji, wiersz);
    })
    .catch(error =>{
        console.error('Failure : ',error)
    })
}



function pokazListe(przedmioty, wrapper, wiersz_na_strone, strona){
    wrapper.innerHTML = "";
    strona--;
    let start = wiersz_na_strone * strona;
    let end = start+wiersz_na_strone;
    let paginatedItems = przedmioty.slice(start,end);
    for(let i= 0; i<paginatedItems.length;i++){

        //let item= objNaString(paginatedItems[i]);
        let item_element = document.createElement('div');
        
        var createA = document.createElement('a');
        var createAText = document.createTextNode(paginatedItems[i].tytul_tematu);
        createA.setAttribute('href',"/forum/"+paginatedItems[i].idkategorie+"/"+paginatedItems[i].idtemat);
        createA.appendChild(createAText);
        wrapper.appendChild(createA);

        item_element.classList.add('item');
        item_element.classList.add('obramowanie')
        
        paginatedItems[i].data_wstawienia = paginatedItems[i].data_wstawienia.toString().slice(0, 16)
        const newStr=paginatedItems[i].data_wstawienia.replace("T"," ")
        item_element.innerText=paginatedItems[i].tresc+"\n"+newStr;
        wrapper.appendChild(item_element);
    }
}

function ZainstalujListe(przedmioty, wrapper, wiersz_na_strone){
    wrapper.innerHTML="";
    let page_count = Math.ceil(przedmioty.length / wiersz_na_strone);
    for(let i=1; i<page_count + 1;i++){
        let btn = PrzyciskPaginacji(i,przedmioty);
        wrapper.appendChild(btn);
    }

}

function PrzyciskPaginacji(strona, przedmioty){
    let przycisk = document.createElement('button');
    przycisk.innerText = strona;
    if(obecna_strona==strona){
        przycisk.classList.add('active');
    }
    przycisk.addEventListener('click', function(){
        obecna_strona=strona;
        pokazListe(przedmioty,element_listy,wiersz ,obecna_strona);
        let current_btn = document.querySelector('.pagenumbers button.active');
        current_btn.classList.remove('active');
        this.classList.remove('active');
        przycisk.classList.add('active');
    })
    return przycisk;
}


function objNaString (obj) {
    var str = '';
    var j=0;
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            if(j%5==0 || j%4==0){
                
            } else {
                str += obj[p] + '\n';
            }
            j++;
        }
    }
    return str;
}

wypelnijListe();