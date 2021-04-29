$(".mojeOgloszenia").on('click', (click)=> {
    var ogloszenieId =  click.currentTarget.attributes[1].value
    window.location.href = '/edycjaOgloszenia/' + ogloszenieId
})