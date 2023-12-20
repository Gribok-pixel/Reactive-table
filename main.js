const table = document.querySelector('.table')
const columnTitls = document.querySelectorAll('.title')
const paginationContainer = document.querySelector('.pagination')

const lineTitle = document.querySelector('.line-title')
const searchInput = document.querySelector('.search')

let activeEffect;

function watch(fn) {
    activeEffect = fn
    fn();
    activeEffect = null
}

class Dependency {
    constructor() {
        this.subscribers = new Set()
    }

    depend() {
        if (activeEffect) this.subscribers.add(activeEffect)
    }

    notify() {
        this.subscribers.forEach((subscribers) => subscribers())
    }
}

function reactive(obj) {
    Object.keys(obj).forEach((key) => {
        const dep = new Dependency()
        let value = obj[key]

        Object.defineProperty(obj, key, {
            get() {
                dep.depend()
                return value
            },
            set(newValue) {
                value = newValue
                dep.notify()
            }
        })
    })

    return obj
}

function createTableLine(table, arr) {
    requestAnimationFrame(() => {
        table.innerHTML = '';
        for (var dataObj of arr) {
            const line = document.createElement('div')
            line.classList.add('line')

            var {id, firstName, lastName, email, phone} = dataObj

            var cellId = document.createElement('div')
            cellId.classList.add('cell')
            cellId.classList.add('id')
            cellId.textContent = id

            var cellName = document.createElement('div')
            cellName.classList.add('cell')
            cellName.classList.add('name')
            cellName.textContent = firstName

            var cellLastname = document.createElement('div')
            cellLastname.classList.add('cell')
            cellLastname.classList.add('last-name')
            cellLastname.textContent = lastName

            var cellEmail = document.createElement('div')
            cellEmail.classList.add('cell')
            cellEmail.classList.add('email')
            cellEmail.textContent = email

            var cellPhone = document.createElement('div')
            cellPhone.classList.add('cell')
            cellPhone.classList.add('phone')
            cellPhone.textContent = phone

            line.append(cellId)
            line.append(cellName)
            line.append(cellLastname)
            line.append(cellEmail)
            line.append(cellPhone)
            table.append(line)
        }
    })
}

function pagination(data, lines) {
    const pagesLength = lines
    const numberOfPages = Math.ceil(data.length / pagesLength)

    const firstPage = data.slice(0, pagesLength)
    createTableLine(table, firstPage)

    paginationContainer.innerHTML = ``
    for (let i = 1; i <= numberOfPages; i++) {
        const paginationBtn = document.createElement('div')
        paginationBtn.classList.add('pagination-btn')
        paginationBtn.textContent = i
        paginationContainer.append(paginationBtn)
    }

    const paginationBtns = document.querySelectorAll('.pagination-btn')
    if (paginationBtns[0]) {
        paginationBtns[0].classList.add('active')
    }

    for (let btn of paginationBtns) {
        btn.addEventListener('click', () => {
            for (activeBtn of paginationBtns) {
                if (activeBtn.classList.contains('active')) {
                    activeBtn.classList.remove('active')
                }
            }
            btn.classList.add('active')


            let num = Number(btn.textContent) - 1
            let page = data.slice(pagesLength * num, pagesLength * num + pagesLength)
            createTableLine(table, page) 
        })
    }
}


const smallData = 'http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D'
const bigData = 'http://www.filltext.com/?rows=1000&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&delay=3&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D'


async function getUsers(url) {
    let res = await fetch(url)
    return res.json()
}


document.querySelector('.small').addEventListener('click', () => {
    table.innerHTML = ` <div class="spinner">
                            <span class="loader"></span>
                        </div>`;
    let users = getUsers(smallData)

    users.then(data => {
        
        const state = reactive({
            users: data
        })
    
        let constDate = state.users
        
        watch(() => {
            pagination(state.users, 5)
        })
    
        function sortDescending(event) {
            if (event === 'id') {
                state.users = state.users.sort((a,b) => {
                    return Number(b.id) - Number(a.id)
                })
            } else {
                state.users = state.users.sort((a,b) => {
                    if (a[event] < b[event]) return 1;
                    if ( a[event] > b[event]) return -1;
                    return 0;
                })
            }
        }
        
        function sortAscending(event) {
            if (event === 'id') {
                state.users = state.users.sort((a,b) => {
                    return Number(a.id) - Number(b.id)
                })
                return
            } else {
                state.users = state.users.sort((a,b) => {
                    if (a[event] < b[event]) return -1;
                    if ( a[event] > b[event]) return 1;
                    return 0;
                })
            }
        }
    
        for (let title of columnTitls) {
            title.addEventListener('click', () => {
                if (title.childNodes[1].classList[1] === 'bi-caret-down') {
                    sortAscending(title.id)
                    title.childNodes[1].classList.remove('bi-caret-down')
                    title.childNodes[1].classList.add('bi-caret-up')
                } else {
                    sortDescending(title.id)
                    title.childNodes[1].classList.remove('bi-caret-up')
                    title.childNodes[1].classList.add('bi-caret-down')
                }
            })
        }
        
        
        searchInput.oninput = function() {
        
            if (searchInput.value === '') {
                state.users = constDate
            }
            
            let inpMap = constDate.filter(item => {
                return  item.firstName.toLowerCase().search(searchInput.value.toLowerCase()) !== -1 ||
                        String(item.id).search(searchInput.value) !== -1 ||
                        item.lastName.toLowerCase().search(searchInput.value.toLowerCase()) !== -1 ||
                        item.email.toLowerCase().search(searchInput.value.toLowerCase()) !== -1 ||
                        item.phone.toLowerCase().search(searchInput.value.toLowerCase()) !== -1
            })
            state.users = inpMap
            
        }
    
        const inputId = document.querySelectorAll('.add-input')
        const submit = document.querySelector('.submit')
    
        submit.addEventListener('click', () => {
            
            let id = inputId[0].value,
                firstName = inputId[1].value,
                lastName = inputId[2].value,
                email = inputId[3].value,
                phone = inputId[4].value;
            let addObj = {
                "id": Number(id),
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "phone": phone,
                "address": {
                    "streetAddress": '-',
                    "city": "-",
                    "state": "-",
                    "zip": "-"
                }
            }
            state.users.unshift(addObj)
            pagination(state.users, 5)
        })
    
    
        const infoCard = document.querySelector('.info-card-data')
        table.addEventListener('click', (e) => {
                let id = e.target.parentNode.childNodes[0].textContent
                let email = e.target.parentNode.childNodes[3].textContent
                
                state.users.find(item => {
                    if (item.id === Number(id) && item.email === email) {
                        infoCard.innerHTML = `  <li>${item.firstName}</li>
                                                <li>${item.lastName}</li>
                                                <li>${item.email}</li>
                                                <li>${item.phone}</li>
                                                <li>${item.description}</li>
                                                <li>${item.address.streetAddress}, ${item.address.city}, ${item.address.state}, ${item.address.zip}</li>`
                    }
                })
        })
    
    })
    
    const searchBtn = document.querySelector('.search-btn')
    searchBtn.addEventListener('click', () => {
        let cells = document.querySelectorAll('.cell')
        for (item of cells) {
            if (item.textContent.toLowerCase().search(searchInput.value.toLowerCase()) !== -1 && searchInput.value !== '') {
                item.style.color = '#f503f5'
                item.style.fontWeight = 700
            }
        }
    })
})


document.querySelector('.big').addEventListener('click', () => {
    table.innerHTML = ` <div class="spinner">
                            <span class="loader"></span>
                        </div>`;
    let users = getUsers(bigData)

    users.then(data => {
        
        const state = reactive({
            users: data
        })
    
        let constDate = state.users
        
        watch(() => {
            pagination(state.users, 50)
        })
    
        function sortDescending(event) {
            if (event === 'id') {
                state.users = state.users.sort((a,b) => {
                    return Number(b.id) - Number(a.id)
                })
            } else {
                state.users = state.users.sort((a,b) => {
                    if (a[event] < b[event]) return 1;
                    if ( a[event] > b[event]) return -1;
                    return 0;
                })
            }
        }
        
        function sortAscending(event) {
            if (event === 'id') {
                state.users = state.users.sort((a,b) => {
                    return Number(a.id) - Number(b.id)
                })
                return
            } else {
                state.users = state.users.sort((a,b) => {
                    if (a[event] < b[event]) return -1;
                    if ( a[event] > b[event]) return 1;
                    return 0;
                })
            }
        }
    
        for (let title of columnTitls) {
            title.addEventListener('click', () => {
                if (title.childNodes[1].classList[1] === 'bi-caret-down') {
                    sortAscending(title.id)
                    title.childNodes[1].classList.remove('bi-caret-down')
                    title.childNodes[1].classList.add('bi-caret-up')
                } else {
                    sortDescending(title.id)
                    title.childNodes[1].classList.remove('bi-caret-up')
                    title.childNodes[1].classList.add('bi-caret-down')
                }
            })
        }
        
        
        searchInput.oninput = function() {
        
            if (searchInput.value === '') {
                state.users = constDate
            }
            
            let inpMap = constDate.filter(item => {
                return  item.firstName.toLowerCase().search(searchInput.value.toLowerCase()) !== -1 ||
                        String(item.id).search(searchInput.value) !== -1 ||
                        item.lastName.toLowerCase().search(searchInput.value.toLowerCase()) !== -1 ||
                        item.email.toLowerCase().search(searchInput.value.toLowerCase()) !== -1 ||
                        item.phone.toLowerCase().search(searchInput.value.toLowerCase()) !== -1
            })
            state.users = inpMap
            
        }
    
        const inputId = document.querySelectorAll('.add-input')
        const submit = document.querySelector('.submit')
    
        submit.addEventListener('click', () => {
            
            let id = inputId[0].value,
                firstName = inputId[1].value,
                lastName = inputId[2].value,
                email = inputId[3].value,
                phone = inputId[4].value;
            let addObj = {
                "id": Number(id),
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "phone": phone,
                "address": {
                    "streetAddress": '-',
                    "city": "-",
                    "state": "-",
                    "zip": "-"
                }
            }
            state.users.unshift(addObj)
            pagination(state.users, 50)
        })
    
    
        const infoCard = document.querySelector('.info-card-data')
        table.addEventListener('click', (e) => {
                let id = e.target.parentNode.childNodes[0].textContent
                let email = e.target.parentNode.childNodes[3].textContent
                
                state.users.find(item => {
                    if (item.id === Number(id) && item.email === email) {
                        infoCard.innerHTML = `  <li>${item.firstName}</li>
                                                <li>${item.lastName}</li>
                                                <li>${item.email}</li>
                                                <li>${item.phone}</li>
                                                <li>${item.description}</li>
                                                <li>${item.address.streetAddress}, ${item.address.city}, ${item.address.state}, ${item.address.zip}</li>`
                    }
                })
        })
    
    })
    
    const searchBtn = document.querySelector('.search-btn')
    searchBtn.addEventListener('click', () => {
        let cells = document.querySelectorAll('.cell')
        for (item of cells) {
            if (item.textContent.toLowerCase().search(searchInput.value.toLowerCase()) !== -1 && searchInput.value !== '') {
                item.style.color = '#f503f5'
                item.style.fontWeight = 700
            }
        }
    })
})









