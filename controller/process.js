/*
 * If the user name is valid, prepare the display to give the user updates
 * while the scraper does its thing.
 */
function prepare(){

  User = {};
  Subreddits = {};
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
    displayStatus();
    displayProgressDetails('Posts analyzed so far...');
    User.stop = false;
    getPage('first', userName);
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
    User.stop = true;
    displayProgressDetails('Posts Analyzed.');
    displayAllData();
    populateSubreddits();
    displaySubredditMenu();
  }
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
 * Creates and sets a 'stop' property in User.  This property is checked 
 * in updateUser.  If User.stop is false, then no more pages will be scraped
 * and the data that has already been collected will be displayed.
 */
function stop(){  
  if(User.stop === false){
    User.stop = true;
    displayErrorMessage('Stopped');
  }
  else{
    displayErrorMessage('Nothing to stop');
  }
}

function populateSubreddits(){

  var i = 0;
  var j = 0;
  while(User[i] instanceof Object){
    j = 0;
    while(User[i][j] instanceof Object){

      if(Subreddits[User[i][j].subreddit] === undefined){
        Subreddits[User[i][j].subreddit] = 1;
      }
      else{
        Subreddits[User[i][j].subreddit]++;
      }
      j++;
    }

    i++;
  }

  console.log(Subreddits);
}

