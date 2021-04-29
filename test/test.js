const { expect, assert } = require("chai")
var chai = require("chai")
var chaiHttp = require("chai-http")
const app = require("../server")



chai.use(chaiHttp)
chai.should()

describe("Ogłoszenia", ()=>{
    describe("GET /ogloszenia", () => {
        it("Powinno zwrócić listę ogłoszeń z odpowiednimi atrybutami dla każdego ogłoszenia", (done) => {
            chai.request(app)
                .get("/ogloszenia")
                .end((err, res) => {
                    var listaOgloszen = res.body
                    res.should.have.status(200)
                    listaOgloszen.should.be.a("array")
                    
                    listaOgloszen.forEach(element => {
                        expect(element).to.have.property("id")
                        expect(element).to.have.property("imie")
                        expect(element).to.have.property("jezyk")
                    });

                    if (listaOgloszen.length > 1){
                        assert(listaOgloszen[0].cena < listaOgloszen[1].cena)
                    }
            
                    done()
                })
        })
    })
})


describe("Tematy forum o okreslonym jezyku", ()=>{
    describe("GET /forumjezyka", () => {
        it("Powinno zwrócić listę tematów forum z określonego języka podanego jako parametr", (done) => {
            chai.request(app)
                .get("/forumjezyka/Angielski")
                .end((err, res) => {
                    res.should.have.status(200)
                    const lista_tematow = res.body
                    lista_tematow.should.be.a("object")
                    lista_tematow.tematy.should.be.a("array")

                    lista_tematow.tematy.forEach(element => {
                        expect(element).to.have.property("idtemat")
                        expect(element).to.have.property("tresc")
                        expect(element).to.have.property("nazwa_kategorii")
                    })
            
                    done()
                })
        })
    })
})


