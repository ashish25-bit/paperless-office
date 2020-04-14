const doc = document.querySelector('.create_doc_con')
const name = document.querySelector('.nameDoc')
const pwd = document.querySelector('.docPass')
const nodocs = document.querySelector('.nodocs')
const p = document.querySelector('.gotodocpass')
let docs

{
    doc.style.display = 'none'    
}

document.querySelector('.create_doc').addEventListener('click', () => doc.style.display = 'block')

document.querySelector('.proceed').addEventListener('click' , (event) => {
    if(name.value == '' || pwd.value == '') {
        event.preventDefault()
        alert('Enter name and password')
    }
    else document.querySelector('.doc_form').setAttribute('action' , '/docs')
        
})

document.querySelector('.cancel_doc').addEventListener('click' , () => {
    name.value = ''
    doc.style.display = 'none'
})
