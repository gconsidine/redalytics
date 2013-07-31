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
    populateSubreddits();
    displaySubredditMenu();
    window.onbeforeunload = leaveAfterLoadWarning;
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
function readyView(view, subView, type){
  if(User.postCount === undefined || User.postCount === 0){
    displayErrorMessage('This thing doesn\'t work unless you "analyze" a user first.');      
  }
  else{
    
    if(User.currentViewId === undefined){
      User.currentViewId = 'home-page'; 
    }

    switch(view){
      
      case 'Overview':
        showLoadingOverlay(User.currentViewId); 
        User.currentViewId = 'overview-page';
        var Posts = readyPostsForOverview(); 
        displayOverview(Posts);
        hideLoadingOverlay(User.currentViewId);
        break;
      case 'Subreddits':
        showLoadingOverlay(User.currentViewId);
        User.currentViewId = 'subreddits-page';
        var Posts = readyPostsFromSubreddit(subView);
        displayPosts(Posts, subView, type);
        hideLoadingOverlay(User.currentViewId);
        break;
      case 'Charts':
        showLoadingOverlay(User.currentViewId);
        User.currentViewId = 'charts-page';
        hideLoadingOverlay(User.currentViewId);
        displayCharts();
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
      if(Post.thumbnail !== undefined && Post.thumbnail.indexOf('redditmedia') !== -1){
        Temp.thumbnail = Post.thumbnail;
      }
      else{
        Temp.thumbnail = '<a class="thumbnail" href=#>'
                       + '<img src="assets/images/nsfw.png" width="70" height="70" /></a>';
      }
      break;
    default:
      break;
  }

  return Temp;
}

/* Retrieves the worst post by karma, and best post by karma */
function readyPostsForOverview(){
  var Posts = {};

  var min = parseInt(User[0][0].karma);
  var max = parseInt(User[0][0].karma);

  var i = 0,
      j = 0,
      k = 0;
  while(User[i] instanceof Object){
    j = 0;
    while(User[i][j] instanceof Object){
      
      if(parseInt(User[i][j].karma) <= min){
        min = parseInt(User[i][j].karma);     
        Posts[0] = loadPost(User[i][j].postType, User[i][j]);
      }

      if(parseInt(User[i][j].karma) >= max){
        max = parseInt(User[i][j].karma);
        Posts[1] = loadPost(User[i][j].postType, User[i][j]);
      }
      
      j++;
    }
    i++;
  }

  return Posts;
}

/* 
 * Uses the Subreddit object that populated the subreddit menu to create an
 * array of sub vs. post count frequency to be passed to the Google pie chart.
 */
function getPieChartArray(){
  var subPie = new Array();
  
  for(sub in Subreddits){
    var temp = new Array();
    temp.push(sub);
    temp.push(Subreddits[sub]);
    subPie.push(temp);
  }
  
  subPie.sort(compareInts);
  subPie = groupTopSubs(subPie);
  subPie.unshift(['Subreddit', 'Posts']);
  return subPie;
}

/*
 * The pie chart can get messy if a user has participated in many subs.  This
 * function keeps the top seven [sub, postCounts] and then groups the rest of
 * into an [other, postCount] array.  If a user has posted in 8 subs or less,
 * the function just returns the passed array.
 */
function groupTopSubs(array){
  if(array.length <= 8){
    return array;
  }

  var temp = ['other', 0]; 
  
  for(var i = 7; i < array.length; i++){
    temp[1] += array[i][1];
  }

  array = array.slice(0, 7)
  array.push(temp);

  return array;
}

/* Compares the post count of two subreddits.  Sorts in descending order.*/
function compareInts(x, y){

  x = parseInt(x[1]);
  y = parseInt(y[1]);

  if(x < y){
    return 1;
  }
  else if(x > y){
    return -1;
  }
  else{
    return 0;
  }
}

/*
 * Prepares an array of posts data used to generate the column/area charts.  A
 * single dimensional array is first created containing time and post type.
 * Time is formatted into a single integer for easy comparison.  For example,
 * 2012-12-21 becomes 20121221.
 */
function getChartArray(type){

  var Posts = new Array();

  var i = 0,
      j = 0,
      k = 0;
  while(User[i] instanceof Object){
    j = 0;
    while(User[i][j] instanceof Object){

      temp = User[i][j].time.substring(0,10);
      temp = temp.replace(/-/g, '');
      Posts[k] = [User[i][j].postType, temp];
      k++;
      j++;
    }
    i++;
  }
  
  if(type === 'column'){
    var months = groupByMonthForColumn(Posts);
    return formatForColumnChart(months);
  }
  else if(type === 'area'){
    var months = groupByMonthForArea(Posts);
    return formatForAreaChart(months);
  }
}

/* 
 * This function groups the Post date/type data into an array of arrays 
 * containing the count of post types for a given month over the last
 * twelve months.
 */
function groupByMonthForColumn(Posts){
  var today = new Date(); 
  var months = new Array();
  
  for(var i = 0; i < Posts.length; i++){
    var postYear = parseInt(Posts[i][1].substring(0, 4));
    var postMonth = parseInt(Posts[i][1].substring(4, 6)); 
    var currentYear = today.getFullYear();
    var currentMonth = today.getMonth() + 1;
    var monthCount = 1;
    
    while(monthCount <= 12){
      if(months[monthCount] === undefined){
        months[monthCount] = new Array();
        months[monthCount][0] = currentMonth + '/' + currentYear;  
        months[monthCount][1] = 0;
        months[monthCount][2] = 0;
        months[monthCount][3] = 0;
      }

      if(postYear === currentYear){
        if(postMonth === currentMonth){
          if(Posts[i][0] === 'comment'){
            months[monthCount][1]++;
          }
          else if(Posts[i][0] === 'link'){
            months[monthCount][2]++;
          }
          else if(Posts[i][0] === 'submission'){
            months[monthCount][3]++;
          }
        }
      }

      monthCount++;
      if(currentMonth === 1){
        currentMonth = 12; 
        currentYear--;
      }
      else{
        currentMonth--;
      }
    }
  }

  return months;
}

/*
 * The array returned from the groupByMonth() function needs to be modified
 * a bit to be in the format required by Google for a column chart.
 */
function formatForColumnChart(months){

  var columns = new Array();
  columns.push(['Months', 'Comments', 'Links', 'Self Posts']);

  for(var i = months.length - 1; i > 0; i--){
    columns.push(months[i]);
  }

  return columns;
}

/* 
 * Similar to groupByMonthForColumn() but a more simplified version since
 * this function only grabs posts not specific types of posts.
 */
function groupByMonthForArea(Posts){
  var today = new Date(); 
  var months = new Array();
  
  for(var i = 0; i < Posts.length; i++){
    var postYear = parseInt(Posts[i][1].substring(0, 4));
    var postMonth = parseInt(Posts[i][1].substring(4, 6)); 
    var currentYear = today.getFullYear();
    var currentMonth = today.getMonth() + 1;
    var monthCount = 1;
    
    while(monthCount <= 12){
      if(months[monthCount] === undefined){
        months[monthCount] = new Array();
        months[monthCount][0] = currentMonth + '/' + currentYear;  
        months[monthCount][1] = 0;
      }

      if(postYear === currentYear){
        if(postMonth === currentMonth){
          months[monthCount][1]++; 
        }
      }

      monthCount++;
      if(currentMonth === 1){
        currentMonth = 12; 
        currentYear--;
      }
      else{
        currentMonth--;
      }
    }
  }

  return months;
}

/* Formats the array into Google charts approved format */
function formatForAreaChart(months){

  var area = new Array();
  area.push(['Months', 'Posts']);

  for(var i = months.length - 1; i > 0; i--){
    area.push(months[i]);
  }

  return area;
}

/* 
 * Gives a warning message to user's who are leaving the site after spending
 * the time to analyze a User.  This is sort of an annoying feature, but I
 * feel like it'd be more annoying to wait to load a user with a long post
 * history and accidentally close the tab/window.
 */
function leaveAfterLoadWarning(){
  return 'All information gathered for ' + User.name + ' will disappear...';
}

/*
 * Opens all reddit links in a new tab (assuming the user is using default 
 * browser settings).
 */
function openInNewTab(url){
  var win = window.open(url, '_blank');
  win.focus();
}

/* 
 * Takes an existing anchor tag as scraped from reddit and inserts the onclick
 * function openInANewTab() to make sure the link opens in a new tab rather
 * than the same window
 */
function anchorFormat(anchor){
  var reHref = /href="/;
  
  var linkOrSelf = false;
  if(anchor.substr(3, 5) === 'class'){
    anchor = anchor.replace('class="title" ', '');
    linkOrSelf = true;
  }

  var reEnd = /"\s/;

  if(anchor.substr(9,3) === '/r/'){
    anchor = anchor.replace(reHref, 'onclick="openInNewTab(\'http://reddit.com');
  }
  else{
    anchor = anchor.replace(reHref, 'onclick="openInNewTab(\'');
  }
  
  if(linkOrSelf){
    anchor = anchor.replace(reEnd, '\');" class="title" ');
  }
  else{
    anchor = anchor.replace(reEnd, '\');"');
  }

  return anchor;
}
