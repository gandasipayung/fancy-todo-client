let currentUser = localStorage.currentUser
let updateId
let city = localStorage.city || 'Jakarta'
let BASE_URL = 'https://cryptic-thicket-24013.herokuapp.com'
// USER QUERY
function onSignIn(googleUser) {
  const token = googleUser.getAuthResponse().id_token;
  $.ajax({
    method: 'POST',
    url: `${BASE_URL}/users/glogin`,
    headers: {
      token
    }
  })
  .done( data => {
    localStorage.token = data.token
    localStorage.currentUser = data.name
    currentUser = data.name
    toastifySuccess(`Welcome Back ${currentUser}`)
    contentPage()
    fetchTodo()
    fetchWeather()
  })
  .fail( err => {
    landingPage()
  })
}

function signInFancy () {
  $('#signIn').on('submit', (e) => {
    e.preventDefault()
    $.ajax({
      method: 'POST',
      url: `${BASE_URL}/users/login`,
      data: {
        email: $('#email-login').val(),
        password: $('#password-login').val()
      }
    })
    .done( data => {
      $('#email-login').val('')
      $('#password-login').val('')
      localStorage.token = data.token
      localStorage.currentUser = data.name
      currentUser = data.name
      toastifySuccess(`Welcome Back ${currentUser}`)
      contentPage()
      fetchTodo()
      fetchWeather()
    })
    .fail(err => {
      
      toastifyFail(err.responseJSON.msg)
    })
  })
}

function signUpFancy () {
  $('#signUp').on('submit', (e) => {
    e.preventDefault()
    let username = $('#username-register').val()
    let email = $('#email-register').val()
    let password = $('#password-register').val()
    $.ajax({
      method: 'POST',
      url: `${BASE_URL}/users/register`,
      data: {
        username,
        email,
        password
      }
    })
    .done( () => {
      $('#username-register').val('')
      $('#email-register').val('')
      $('#password-register').val('')
      $('#registerModal').modal('hide')
      landingPage()
    })
    .fail( err => {
      if(err.responseJSON.hasOwnProperty('errors')){
        toastifyFail(err.responseJSON.errors[0])
      } else {
        toastifyFail(`Email Already Used ! Choose Another Email`)
      }
    })
  })
}

function signOutFancy () {
  $('#SignOut').on('click', () => {
    localStorage.clear()
    currentUser = ''
    landingPage()
  })
}

function signOut() {
  $('#SignOut').on('click', function() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      localStorage.clear()
      currentUser = ''
      landingPage()
    })
  })
}

// Notification
function toastifyFail (msg) {
  Toastify({
    text: `${msg}`,
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "top",
    position: 'left',
    backgroundColor: "red",
    stopOnFocus: true,
  }).showToast();
}

function toastifySuccess (msg) {
  Toastify({
    text: `${msg}`,
    duration: 3000,
    destination: "https://github.com/apvarun/toastify-js",
    newWindow: true,
    close: true,
    gravity: "top",
    position: 'left',
    backgroundColor: "green",
    stopOnFocus: true,
  }).showToast();
}

// CRUD TODO
function fetchTodo () {
  $.ajax({
    method: 'GET',
    url: `${BASE_URL}/todos`,
    headers: {
      token: localStorage.token
    }
  })
  .done(({ data }) => {
    $('#content-done').empty()
    $('#content-todo').empty()
    data.forEach((todo, i) => {
      const date = todo.due_date.split('-')
      const fixDate = `${date[2]}-${date[1]}-${date[0]}`
      if(!todo.status) {
        $('#content-todo').append(`
          <tr>
            <th scope="row">${i + 1}</th>
            <td>${todo.title}</td>
            <td>${todo.description}</td>
            <td>${fixDate}</td>
            <td>
            <span style="cursor: pointer;" onclick="editTodo(${todo.id})">Edit</span> |
            <span style="cursor: pointer;" onclick="doneTodo((${todo.id}), true)">Done</span> | 
            <span style="cursor: pointer;" onclick="deleteTodo(${todo.id})">Delete</span>
            </td>
          </tr>
        `)
      } else {
        $('#content-done').append(`
        <tr>
          <th scope="row">${i + 1}</th>
          <td>${todo.title}</td>
          <td>${todo.description}</td>
          <td>${fixDate}</td>
          <td>
          <span style="cursor: pointer;" onclick="editTodo(${todo.id})">Edit</span> |
          <span style="cursor: pointer;" onclick="doneTodo((${todo.id}), false)">Undone</span> | 
          <span style="cursor: pointer;" onclick="deleteTodo(${todo.id})">Delete</span>
          </td>
        </tr>
      `)
      }
    })
  })
  .fail(err => {
    console.log(err)
  })
}

function addTodo () {
  $('#add-todo').on('submit', (e) => {
    e.preventDefault()
    $.ajax({
      method: 'POST',
      url: `${BASE_URL}/todos`,
      data: {
        title: $('#title').val(),
        description: $('#description').val(),
        due_date: $('#due_date').val()
      },
      headers: {
        token: localStorage.token
      }
    })
    .done(({ data }) => {
      toastifySuccess(`Adding Todo ${data.title} Success !`)
      $('#title').val('')
      $('#description').val('')
      $('#due_date').val('')
      fetchTodo()
    })
    .fail( err => {
      toastifyFail(err.responseJSON.errors[0])
    })
  })
}

function editTodo (id) {
  updateId = id
  $('#contentPage').hide()
  $('#formEdit').show()
  $('#Navbar').show()
  $.ajax({
    method: 'GET',
    url: `${BASE_URL}/todos/${id}`,
    headers: {
      token: localStorage.token
    }
  })
  .done(({ data }) => {
    $('#title-update').val(`${data.title}`)
    $('#description-update').val(`${data.description}`)
    $('#due_date-update').val(`${data.due_date}`)
  })
  .fail(err => {
    console.log(err)
  })
}

function updateTodo () {
  $('#update-todo').on('submit', (e) => {
    e.preventDefault()
    $.ajax({
      method: 'PUT',
      url: `${BASE_URL}/todos/${updateId}`,
      data: {
        title: $('#title-update').val(),
        description: $('#description-update').val(),
        due_date: $('#due_date-update').val()
      },
      headers: {
        token: localStorage.token
      }
    })
    .done(({ data }) => {
      toastifySuccess('Update Todo Success !')
      $('#title-update').val('')
      $('#description-update').val('')
      $('#due_date-update').val('')
      updateId = ''
      fetchTodo()
      contentPage()
      
    })
    .fail(err => {
      toastifyFail('Update Todo Failed!')
    })
  })
}

function doneTodo (id, v) {
  $.ajax({
    method: 'PUT',
    url: `${BASE_URL}/todos/${id}`,
    data: {
      status: v
    },
    headers: {
      token: localStorage.token
    }
  })
  .done( ({ data }) => {
    if(data.status){
      toastifySuccess(`Todo: ${data.title} Has Been Done !`)
    } else {
      toastifySuccess(`Todo: ${data.title} Has Been Undone !`)
    }
    fetchTodo()
  })
  .fail(err => {
    console.log(err)
  })

}

function deleteTodo (id) {
  $.ajax({
    method: 'DELETE',
    url: `${BASE_URL}/todos/${id}`,
    headers: {
      token: localStorage.token
    }
  })
  .done(() => {
    toastifySuccess(`Delete Todo Success !`)
    fetchTodo()
  })
  .fail(err => {
    toastifyFail(`Delete Todo Fail !`)
    console.log(err)
  })
}

// PAGE MANAGE
function landingPage () {
  $('#landingPage').show()
  $('#Navbar').hide()
  $('#contentPage').hide()
  $('#formEdit').hide()
  $('footer').hide()
}

function contentPage () {
  fetchName()
  $('#Navbar').show()
  $('#contentPage').show()
  $('#landingPage').hide()
  $('#formEdit').hide()
  $('footer').show()
}

function fetchName () {
  $('#currentUser').empty()
  $('#currentUser').append(`Welcome ${currentUser}`)
}

function backHome () {
  $('#cancel').on('click', (e) => {
    contentPage()
  })
}

// weather
function checkWeather () {
  $('#weather').on('submit', (e) => {
    e.preventDefault()
    city = $('#city').val()
    localStorage.city = $('#city').val()
    $('#city').val('')
    fetchWeather()
  })
}

function fetchWeather (){
    $.ajax({
      method: 'GET',
      url: `${BASE_URL}/weathers/${city}`
    })
    .done( data => {
      let weather = {
        main: data.weather[0].main,
        description: data.weather[0].description,
        temp: data.main.temp,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        humidity: data.main.humidity,
        city: data.name
      }
      $('#weather-detail').empty()
      $('#weather-detail').append(`
      <tr>
        <td>City</td>
        <td>${city}</td>
      </tr>
      <tr>
        <td>${weather.main}</td>
        <td>${weather.description}</td>
      </tr>
      <tr>
        <td>Temp</td>
        <td>${weather.temp} &#8457</td>
      </tr>
      <tr>
        <td>Temp Min</td>
        <td>${weather.temp_min} &#8457</td>
      </tr>
      <tr>
        <td>Temp Max</td>
        <td>${weather.temp_max} &#8457</td>
      </tr>
      <tr>
        <td>Humidity</td>
        <td>${weather.humidity}%</td>
      </tr>
      `)
    })
    .fail(err => console.log(err))
}


// DOCUMENT READY
$(document).ready(() => {
  if(localStorage.getItem('token')) {
    fetchName()
    contentPage()
    fetchTodo()
    // 3rd party
    checkWeather()
    fetchWeather()
  } else {
    landingPage()
  }
  // user
  signOut()
  signInFancy()
  signUpFancy()
  
  // todo
  addTodo()
  updateTodo()

  // asd
  backHome()
})