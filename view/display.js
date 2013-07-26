function displayAllData(){
  console.log(User);
}

/* Displays the current post count or a loading .gif if no post count has been returned yet */
function displayStatus(){

  if(document.getElementById('status').style.visiblity !== 'visible'){
    document.getElementById('status').style.visibility = 'visible';
  }
  
  if(User.postCount !== undefined && User.postCount !== 0){
    document.getElementById('post-count').innerHTML = User.postCount;
  }
  else{
    document.getElementById('post-count').innerHTML = '<img src="assets/images/loading.gif" />';
  }
}

/* Let's the user know if scraping is finished or still in progress */
function displayProgressDetails(message){
  document.getElementById('progress-details').innerHTML = message;
}

/* 
 * The status (containing post count and progress message) is re-hidden from
 * the user in the situation that no user data is found.
 */
function hideStatus(){
  document.getElementById('status').style.visibility = 'hidden';
}

/* Keeps the user informed about why buttons don't work at certain times */
function displayErrorMessage(message){
  document.getElementById('error-message').innerHTML = message;
  document.getElementById('error-message').style.visibility = 'visible';
}

/* 
 * The subreddit menu is generated based on the Subreddits object populated from
 * a user's post history.  This sub-menu fits in beneath "Subreddits" on the side
 * menu.
 */
function displaySubredditMenu(){
  
  var menu = '<table id="sub-menu-table" cellspacing="0">';
  for(var sub in Subreddits){
    menu += '<tr onclick="readyView(\'Subreddits\', \'' + sub + '\');">'
          + '<td class="sub">' + sub + '</td><td class="count">' + Subreddits[sub] + '</td><tr>';
  }
  menu += '</table>';

  document.getElementById('subreddit-menu').innerHTML = menu;
  document.getElementById('subreddit-menu').style.height = '100%';
}

/* If the error message is no longer relevant, hide it. */
function hideErrorMessage(){
  document.getElementById('error-message').style.visibility = 'hidden';
}

/* Hide the previous view and show the loading overlay */
function showLoadingOverlay(currentViewId){
  document.getElementById('loading-overlay').style.display = 'block';
  document.getElementById(currentViewId).style.display = 'none'; 
  document.getElementById('loading-overlay-status').innerHTML = 'Loading content...';
  document.getElementById('loading-overlay-gif').innerHTML = '<img src="assets/images/loading.gif" />';
}

function displaySubredditPosts(Posts, subView){
  
  var title = '<h3>' + subView + ' posts</h3>';
  var postHtmlString = '';

  var i = 0;
  while(Posts[i] instanceof Object){
    var thumbnail = '';
    
    if(Posts[i].postType === 'link'){
      postHtmlString += Posts[i].thumbnail; 
    }

    postHtmlString += '<div class="post">' + Posts[i].title + ' by ' 
                   + '<a class="user" href="reddit.com/u/' + Posts[i].author + '">'
                   + Posts[i].author + '</a> in <a class="sub" href="reddit.com/r/' + Posts[i].sub + '">'
                   + Posts[i].sub + '</a><p class="post-info"><a class="user" href="reddit.com/u/' 
                   + User.name + '">' + User.name + '</a> ' + Posts[i].karma + ' '
                   + Posts[i].time.replace('T', ' ') + '</p>';

    if(Posts[i].postType === 'comment'){
      postHtmlString += '<p class="post-comment">' + Posts[i].comment + '</p>'; 
    }
    
    postHtmlString += '<p class="full-comments">' + Posts[i].fullComments + '</p>'
                   + '</div><div style="clear:both"></div>';
    i++;  
  }

  document.getElementById('subreddits-page').innerHTML = title + postHtmlString;
}

/* Hide the loading overlay and show the new view */
function hideLoadingOverlay(currentViewId){
  document.getElementById('loading-overlay').style.display = 'none';
  document.getElementById(currentViewId).style.display = 'block';
}

