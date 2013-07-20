/* Declare User in the global scope for later access */
var User = {};

/* 
 * Function containing Ajax POST request.  The variable pageType determines
 * the flow of logic -- whether to establish the User object with user
 * account details and then scrape posts, or to just scrape posts of
 * a user's next page of post history.
 */
function getPage(pageType, user, link){
  
  /* Create XMLHttpRequest instance */
  if(window.XMLHttpRequest){
    httpRequest = new XMLHttpRequest();
  }
  else if(window.ActiveXObject){
    try{
      httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
    }
    catch(e){
      try{
        httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
      }
      catch(e){}
    }
  }

  if(!httpRequest){
    console.log('Cannot create an XMLHTTP instance');
    return false;
  }
  
  /* 
   * Set parameters based on whether the PHP script is to scrape the first
   * page of a user's history or a subsequent page of posts
   */
  var params = '';
  httpRequest.onreadystatechange = alertContents;

  if(pageType === 'first'){
    params = 'page=' + pageType + '&user_account=' + user;
      }
  else if(pageType === 'hasNext'){
    params = 'page=' + pageType + '&link=' + link;
  }
  else{
    console.log('There was an error encoutering that page');
  }
  
  /* Make POST request to an intermidiary PHP script */
  httpRequest.open('POST', 'ajax.glue.php');
  httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  httpRequest.send(params);
  
  /* 
   * If the request is successful, then call the appropriate function to process
   * the response based on pageType.
   */
  function alertContents(){
    if(httpRequest.readyState === 4){
      if(httpRequest.status === 200){

        switch(pageType){
          case 'first':
            updateUser(httpRequest.responseText, pageType);
            break;
          case 'hasNext':
            updateUser(httpRequest.responseText);
            break;
          default:
            break;
        }
      }
    } 
  }
}

/*
 * Every Ajax request returns a page of a user's post history and adds the
 * data to the User object.  If the response returned is from the first 
 * page, then there is unique data to grab (trophies, karma, etc.) that 
 * isn't included on subsequent responses.
 */
function updateUser(response, pageType){

  var json = JSON.parse(response);

  /* 
   * Load first-page specific information into User, or give the user a 
   * status message if the user account doesn't exist.
   */
  if(pageType === 'first'){
    
    if(json['userExists'] === false){
      displayErrorMessage('User does not exist');
      switchButtons();
      hideStatus();
      return false;
    }

    User.name = json['name'];
    User.linkKarma = json['linkKarma'];
    User.commentKarma = json['commentKarma'];
    User.memberSince = json['memberSince'];
  }
  
  /* These values are used to keep the user informed of progress */
  User[User.pageCount] = json;
  User.pageCount++;
  User.postCount += json['postCount'];

  displayStatus(); 
  
  /* 
   * If there's another page of post history to scrape, scrape it.  Otherwise,
   * format and display the collected data.
   */
  if(json['link'] !== null && User.stop !== true){
    getPage('hasNext', null, json['link']);
  }
  else{
    switchButtons();
    displayAllData();
  }
}


function displayAllData(){
  console.log(User);
}

/* Validates the reddit user name entered by the user */
function validateUserName(userName){
  var pattern = /^[\w-_]{3,20}$/;
  return pattern.test(userName);
}

/* 
 * If the user presses the enter key while the input field is in focus, call
 * the prepare function to validate the user name and begin scraping.
 */
function keyCheck(e){
  if(e.keyCode === 13){
    prepare();
  }
}

/*
 * If the user name is valid, prepare the display to give the user updates
 * while the scraper does its thing.
 */
function prepare(){

  User = {};
  User.pageCount = 0;
  User.postCount = 0;
  hideErrorMessage();
  hideStatus();

  var userName = document.getElementById('user-name').value; 
  
  if(!validateUserName(userName)){
    displayErrorMessage('Invalid user name');
    return false;
  }
  else{
    switchButtons();
    displayStatus();
    getPage('first', userName);
  }
}

function switchButtons(){
  
  var analyze = document.getElementById('analyze-button');
  var stop = document.getElementById('stop-button');

  if(stop.style.visibility === 'hidden'){
    analyze.style.visibility = 'hidden';
    stop.style.visibility = 'visible';
  }
  else{
    stop.style.visibility = 'hidden';
    analyze.style.visibility = 'visible';
  }
}

/* 
 * Displays the current post count and a stupid message.
 */
function displayStatus(){

  if(document.getElementById('status').style.visiblity !== 'visible'){
    document.getElementById('status').style.visibility = 'visible';
  }
  
  if(User.postCount !== undefined && User.postCount !== 0){
    document.getElementById('post-count').innerHTML = User.postCount;
  }
  else{
    document.getElementById('post-count').innerHTML = '<img id="loading" src="images/loading.gif" />';
  }
}

function hideStatus(){
  document.getElementById('status').style.visibility = 'hidden';
}

function displayErrorMessage(message){
  document.getElementById('error-message').innerHTML = message;
  document.getElementById('error-message').style.visibility = 'visible';
}

function hideErrorMessage(){
  document.getElementById('error-message').style.visibility = 'hidden';
}

/*
 * Creates and sets a 'stop' property in User.  This property is checked 
 * in updateUser.  If User.stop is false, then no more pages will be scraped
 * and the data that has already been collected will be displayed.
 */
function stop(){  
  if(typeof User != undefined){
    User.stop = true;
  }
}

/*
 * A collection of messages that are displayed at different times depending on
 * the current number of posts analyzed
 */
function getStatusMessage(postCount){
  
  //var messages = ['...', '

}
