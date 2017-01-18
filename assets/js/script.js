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
  var currentTime = moment();
  // var nextTrain = '';
  // var trainOnDeck = '';
  // var timer = '';
  // var minAway = "";

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

    // Push to firebase
    dataRef.ref().child('trains').push({
      trainName: trainName,
      trainDestination: trainDestination,
      trainTime: trainTime,
      trainFreq: trainFreq,

    })
  });




  // Reference Firebase when page loads to check for stored information 
  dataRef.ref().child('trains').on('child_added', function(childSnapshot){
    
    console.log(childSnapshot.val());
    var trainClass = childSnapshot.key;
    var trainId = childSnapshot.val();

    var firstTimeConverted = moment.unix(trainId.trainTime);
    var timeDiff = moment().diff(moment(firstTimeConverted, 'HH:mm'), 'minutes');

    var timeDiffCalc = timeDiff % parseInt(trainId.trainFreq);
    var timeDiffTotal = parseInt(trainId.trainFreq) - timeDiffCalc;

    var newTime;

    if(timeDiff > 0) {
      newTime = currentTime.add(timeDiffTotal, 'minutes').format('hh:mm A');
    } else {
      newTime = firstTimeConverted.format('hh:mm A');
      timeDiffTotal = Math.abs(timeDiff - 1);
    }

    console.log(newTime);

    $('tbody').append("<tr class=" + trainClass + "><td>" + trainId.trainName + "</td><td>" +
      trainId.trainDestination + "</td><td>" + 
      trainId.trainFreq + "</td><td>" +
      newTime + "</td><td>" +
      timeDiffTotal + "</td><td><button type='button' class='delete' data-train=" + trainClass + ">Remove</button></td></tr>");
  }, function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
  });



    $(document).on('click','.delete', function(){
      var trainKey = $(this).attr('data-train');
      dataRef.ref("trains/" + trainKey).remove();
      $('.'+ trainKey).remove();
    })

});