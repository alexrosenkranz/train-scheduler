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

  // Declare variables

  var dataRef = firebase.database();

  var trainName = '';
  var trainDestination = '';
  var trainTime = '';
  var trainFreq = 0;
  var minAway = 0;
  var currentTime = moment();

  // Set form function to accept inputs and set them into Firebase Object
    // Make sure time is converted properly for storage (unix)
    // Append new item into table

  $('.submit').on('click', function(e) {

    e.preventDefault();
    // Grab input values
    trainName = $('#trainName').val().trim();
    trainDestination = $('#trainDestination').val().trim();
    trainTime = $('#firstTrain').val().trim();
    trainFreq = $('#trainFrequency').val().trim();

    trainTime = moment(trainTime, "HH:mm").unix();


    // Clear form data
    $('#trainName').val('');
    $('#trainDestination').val('');
    $('#firstTrain').val('');
    $('#trainFrequency').val('');

    // Push to firebase
    dataRef.ref().push({
      trainName: trainName,
      trainDestination: trainDestination,
      trainTime: trainTime,
      trainFreq: trainFreq,
    })
  });



  // Reference Firebase when page loads to check for stored information 
  dataRef.ref().on('child_added', function(childSnapshot){
    console.table(childSnapshot.val());

    $('tbody').append("<tr class=" + childSnapshot.val() + "><td>" + childSnapshot.val().trainName + "</td><td>" +
      childSnapshot.val().trainDestination + "</td><td>" + 
      childSnapshot.val().trainFreq + "</td><td>" +
      childSnapshot.val().trainTime + "</td><td>" +
      childSnapshot.val().minAway + "</td></tr>");
  }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
  });









});