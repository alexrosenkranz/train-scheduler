$(document).ready(function(){
  
  // Init Firebase
  var config = {
    apiKey: "AIzaSyCjBTsndWZJIcH5D83x9WujIhfSbGTwafk",
    authDomain: "train-scheduler-65708.firebaseapp.com",
    databaseURL: "https://train-scheduler-65708.firebaseio.com",
    storageBucket: "train-scheduler-65708.appspot.com",
    messagingSenderId: "167602757568"
  };
  firebase.initializeApp(config);
  

$('.content').hide();
// Using a popup.
var provider = new firebase.auth.GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');

$(document).on('click', '.signIn', function() {
  firebase.auth().signInWithPopup(provider).then(function(result) {
   // This gives you a Google Access Token.
   var token = result.credential.accessToken;
   // The signed-in user info.
   var user = result.user;
   $('.content').show();
   
  });
  $(this).removeClass('signIn')
    .addClass('signOut')
    .html('Sign Out Of Google');
});

$(document).on('click', '.signOut', function () {
  firebase.auth().signOut().then(function() {
    $('.content').hide();
  }, function(error) {
    // An error happened.
  });
  $(this).removeClass('signOut')
    .addClass('signIn')
    .html('Sign In With Google');
});





  // Declare variables

  var dataRef = firebase.database();
  var editTrainKey = '';
  var fbTime = moment();
  var newTime;


  // Set form function to accept inputs and set them into Firebase Object
    // Make sure time is converted properly for storage (unix)
    // Append new item into table

  $('.submit').on('click', function(e) {

    e.preventDefault();
    // Grab input values
    var trainName = $('#trainName').val().trim();
    var trainDestination = $('#trainDestination').val().trim();
    // Convert to Unix
    var trainTime = moment($('#firstTrain').val().trim(),"HH:mm").format("X");
    var trainFreq = $('#trainFrequency').val().trim();

    // Clear form data
    $('#trainName').val('');
    $('#trainDestination').val('');
    $('#firstTrain').val('');
    $('#trainFrequency').val('');
    $('#trainKey').val('');

    fbTime = moment().format('X');
    // Push to firebase
    if (editTrainKey == ''){ 
      dataRef.ref().child('trains').push({
        trainName: trainName,
        trainDestination: trainDestination,
        trainTime: trainTime,
        trainFreq: trainFreq,
        currentTime: fbTime,
      })
    } else if (editTrainKey != '') {
      dataRef.ref('trains/' + editTrainKey).update({
        trainName: trainName,
        trainDestination: trainDestination,
        trainTime: trainTime,
        trainFreq: trainFreq,
        currentTime: fbTime,
      })
      editTrainKey = '';
    }

  });

  function timeUpdater() {
    dataRef.ref().child('trains').once('value', function(snapshot){
      snapshot.forEach(function(childSnapshot){
        fbTime = moment().format('X');
        dataRef.ref('trains/' + childSnapshot.key).update({
        currentTime: fbTime,
        })
      })
      
    });
  }

  setInterval(timeUpdater, 10000);


  // Reference Firebase when page loads to check for stored information 
  dataRef.ref().child('trains').on('value', function(snapshot){
    $('tbody').empty();
    snapshot.forEach(function(childSnapshot){
    var trainClass;
    var TrainId;
    var firstTimeConverted = 0;
    var timeDiff = 0;
    var timeDiffCalc = 0;
    var timeDiffTotal = 0;

    trainClass = childSnapshot.key;
    trainId = childSnapshot.val();

    firstTimeConverted = moment.unix(trainId.trainTime);
    timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');

    timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
    timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;


    if(timeDiff >= 0) {
      newTime = null;
      newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');

    } else {
      newTime = null;
      newTime = firstTimeConverted.format('hh:mm A');
      timeDiffTotal = Math.abs(timeDiff - 1);
    }

    $('tbody').append("<tr class=" + trainClass + "><td>" + trainId.trainName + "</td><td>" +
      trainId.trainDestination + "</td><td>" + 
      trainId.trainFreq + "</td><td>" +
      newTime + "</td><td>" +
      timeDiffTotal + "</td><td><button class='edit btn btn-warning' data-train=" + trainClass + ">Edit</button> <button class='delete btn btn-danger' data-train=" + trainClass + ">Remove</button></td></tr>");

  });
  }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
  });

   // Reference Firebase when page loads to check for stored information 
  dataRef.ref().child('trains').on('child_changed', function(childSnapshot){
    
    var trainClass;
    var TrainId;
    var firstTimeConverted;
    var timeDiff;
    var timeDiffCalc;
    var timeDiffTotal;
    
    trainClass = childSnapshot.key;
    trainId = childSnapshot.val();

    firstTimeConverted = moment.unix(trainId.trainTime);
    timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');

    timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
    timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;


    if(timeDiff > 0) {
      newTime = moment().add(timeDiffTotal, 'minutes').format('hh:mm A');
    } else {
      newTime = firstTimeConverted.format('hh:mm A');
      timeDiffTotal = Math.abs(timeDiff - 1);
    } 

    $('.'+trainClass).html("<td>" + trainId.trainName + "</td><td>" +
      trainId.trainDestination + "</td><td>" + 
      trainId.trainFreq + "</td><td>" +
      newTime + "</td><td>" +
      timeDiffTotal + "</td><td><button class='edit btn btn-warning' data-train=" + trainClass + ">Edit</button><button class='delete btn btn-danger' data-train=" + trainClass + ">Remove</button></td>");


  }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
  });




  $(document).on('click','.delete', function(){
    var trainKey = $(this).attr('data-train');
    dataRef.ref("trains/" + trainKey).remove();
    $('.'+ trainKey).remove();
  });

  $(document).on('click','.edit', function(){
    editTrainKey = $(this).attr('data-train');
    dataRef.ref("trains/" + editTrainKey).once('value').then(function(childSnapshot) {
      $('#trainName').val(childSnapshot.val().trainName);
      $('#trainDestination').val(childSnapshot.val().trainDestination);
      $('#firstTrain').val(moment.unix(childSnapshot.val().trainTime).format('HH:mm'));
      $('#trainFrequency').val(childSnapshot.val().trainFreq);
      $('#trainKey').val(childSnapshot.key);

    })
    
  });

  setInterval(function(){
    $('small').html(moment().format('hh:mm:ss A'))
  }, 1000);

});