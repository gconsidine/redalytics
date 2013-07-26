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
    displayProgressDetails('posts analyzed so far...');
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
      displayErrorMessage('User does not exist.');
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
    displayProgressDetails('posts analyzed.');
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
    displayErrorMessage('Stopped.');
  }
  else{
    displayErrorMessage('Nothing to stop.');
  }
}

/* 
 * Loops through the the user's posts and populates a Subreddits object
 * consiting of a subreddit name as a property which maps to a corresponding
 * count of posts in that subreddit.  This object is used to generate the
 * subreddit sub-menu.
 */
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
}

/*
 * After the page is scraped, the user's post data is only stored client side.
 * To avoid page loads and make things more speedy, the DOM is just manipulted
 * to show the information the user wants to see while hiding the information
 * the user was just looking at.  An intermediary loading overlay is used while
 * the new view is readied.
 */
function readyView(view, subView){
  if(User.postCount === undefined || User.postCount === 0){
    displayErrorMessage('This thing doesn\'t work unless you "analyze" a user first.');      
  }
  else{

    if(User.currentView === undefined){
      User.currentViewId = 'home-page'; 
    }

    switch(view){
      
      case 'Overview':
        showLoadingOverlay(User.currentViewId); 
        User.currentViewId = 'overview-page';
        //call function to arrange data
        //call function to display data
        //call hideLoadingOverlay
        break;
      case 'Subreddits':
        showLoadingOverlay(User.currentViewId);
        User.currentViewId = 'subreddits-page';
        var Posts = readyPostsFromSubreddit(subView);
        displaySubredditPosts(Posts, subView);
        hideLoadingOverlay(User.currentViewId);
        break;
      case 'subreddit':
        showLoadingOverlay(User.currentViewId);
        User.currentViewId = 'specific-sub-page';
        break;
      case 'Charts':
        showLoadingOverlay(User.currentViewId);
        User.currentViewId = 'charts-page';
        break;
      case 'Search':
        showLoadingOverlay(User.currentViewId);
        User.currentViewId = 'search-page';
        break;
      default:
        break;
    }
  }
}

/*
 * Loops through the User object and creates a new object filled with all the
 * posts the user has ever made for a given subreddit.  This Posts object is
 * then passed to the displaySubredditPosts() function to add HTML and display
 * on the page.
 */
function readyPostsFromSubreddit(subreddit){
  
  var Posts = {};

  var i = 0,
      j = 0,
      k = 0;
  while(User[i] instanceof Object){
    j = 0;
    while(User[i][j] instanceof Object){

      if(subreddit === 'all'){
        Posts[k] = loadPost(User[i][j].postType, User[i][j]);
        k++;
      }
      else if(subreddit === User[i][j].subreddit){
        Posts[k] = loadPost(User[i][j].postType, User[i][j]);
        k++;
      }
      j++;
    }
    i++;
  }

  return Posts;
}

/* 
 * Loads an individual post into an object and then returns the result to be
 * added to Posts, which is a collection of individual posts populated with
 * this function.
 */
function loadPost(type, Post){
  var Temp = {
    title : Post.title,
    author : Post.author,
    sub : Post.subreddit,
    karma : Post.karma,
    time : Post.time,
    fullComments : Post.fullComments,
    postType : Post.postType
  };

  switch(type){
    case 'comment':
      Temp.comment = Post.userComment;
      break;
    case 'link':
      if(Post.thumbnail.indexOf('redditmedia') !== -1){
        Temp.thumbnail = Post.thumbnail;
      }
      else{
        Temp.thumbnail = '';
      }
      break;
    default:
      break;
  }

  return Temp;
}

