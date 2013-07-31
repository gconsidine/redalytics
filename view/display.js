var Display = {};

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
    menu += '<tr id="' + sub + '" onclick="readyView(\'Subreddits\', \'' + sub + '\', \'all\');">'
          + '<td><a class="sub">' + sub + '</a></td><td class="count"><a class="sub">' 
          + Subreddits[sub] + '</a></td><tr>';
  }
  menu += '</table>';

  document.getElementById('subreddit-menu').innerHTML = menu;
  document.getElementById('subreddit-menu').style.height = '100%';
}

/* If the error message is no longer relevant, hide it. */
function hideErrorMessage(){
  document.getElementById('error-message').style.visibility = 'hidden';
}



/* 
 * Displays all posts in a given subreddit.  All is shown by default.
 * Furthermore, this function allows the user to drill down further to see
 * all posts, all comments, all links, or all self-posts within a given
 * subreddit.
 */
function displayPosts(Posts, subView, type){

  if(subView === 'all'){
    toggleFocus(document.getElementById('menu-sub'));
  }
  else{
    toggleFocus(document.getElementById(subView), true);
  }

  var title = formatTitle(subView);              

  /* 
   * Posts are looped through and formatted one at a time and then dumped
   * into the subreddit's view (div) when finished.
   */
  var postHtmlString = '<div style="clear:both"></div>';
  var i = 0;
  while(Posts[i] instanceof Object){

    if(type === 'all' || type === Posts[i].postType){

      var thumbnail = '';
      if(Posts[i].postType === 'link'){
        postHtmlString += '<div class="image-container">' + Posts[i].thumbnail + '</div>'; 
      }

      postHtmlString += '<div class="post">' + anchorFormat(Posts[i].title) + ' by ' 
                     + '<a class="user" onclick="openInNewTab(\'http://reddit.com/u/' + Posts[i].author + '\');">'
                     + Posts[i].author + '</a> in <a class="sub" onclick="openInNewTab(\'http://reddit.com/r/' + Posts[i].sub + '\');">'
                     + Posts[i].sub + '</a><p class="post-info"><a class="user" onclick="openInNewTab(\'http://reddit.com/u/' 
                     + User.name + '\');">' + User.name + '</a> ' + Posts[i].karma + ' points '
                     + Posts[i].time.substr(0, 10) + '</p>';

      if(Posts[i].postType === 'comment'){
        postHtmlString += '<p class="post-comment">' + Posts[i].comment + '</p>'; 
      }
      
      postHtmlString += '<p class="full-comments">' + anchorFormat(Posts[i].fullComments) + '</p>'
                     + '</div><div style="clear:both"></div>';
    }

    i++;  
  }

  document.getElementById('subreddits-page').innerHTML = title + postHtmlString;
}

function formatSinglePost(Post){

  var postHtmlString = '<div style="clear:both"></div>';

  var thumbnail = '';

  if(Post.postType === 'link'){
    postHtmlString += '<div class="image-container">' + Post.thumbnail + '</div>'; 
  }
  anchorFormat(Post.title);
  postHtmlString += '<div class="post">' + anchorFormat(Post.title) + ' by ' 
                 + '<a class="user" onclick="openInNewTab(\'http://reddit.com/u/' + Post.author + '\');">'
                 + Post.author + '</a> in <a class="sub" onclick="openInNewTab(\'http://reddit.com/r/' + Post.sub + '\');">'
                 + Post.sub + '</a><p class="post-info"><a class="user" onclick="openInNewTab(\'http://reddit.com/u/' 
                 + User.name + '\');">' + User.name + '</a> ' + Post.karma + ' points '
                 + Post.time.substr(0, 10) + '</p>';

  if(Post.postType === 'comment'){
    postHtmlString += '<p class="post-comment">' + Post.comment + '</p>'; 
  }
  
  postHtmlString += '<p class="full-comments">' + anchorFormat(Post.fullComments) + '</p>'
                  + '</div><div style="clear:both"></div>';

  return postHtmlString;
}

/* 
 * Takes an existing anchor tag as scraped from reddit and inserts the onclick
 * function openInANewTab() to make sure the link opens in a new tab rather
 * than the same window
 */
function anchorFormat(anchor){

  var reHref = /href="/;
  var reEnd = /"\s/;

  if(anchor.substr(9,3) === '/r/'){
    anchor = anchor.replace(reHref, 'onclick="openInNewTab(\'http://reddit.com');
  }
  else{
    anchor = anchor.replace(reHref, 'onclick="openInNewTab(\'');
  }
   
  anchor = anchor.replace(reEnd, '\');"');
  
  return anchor;
}
/* Formats the title header and menu for a given subreddit view */
function formatTitle(subView){
  var title = '<p id="cat" class="subreddit-title">' + subView + ' posts</p>'
            + '<p class="subreddit-sub-menu">'
            + '<a onclick="readyView(\'Subreddits\', \'' + subView + '\', \'all\');"\>All</a> | '
            + '<a onclick="readyView(\'Subreddits\', \'' + subView + '\', \'comment\');"\>Comments</a> | '
            + '<a onclick="readyView(\'Subreddits\', \'' + subView + '\', \'submission\');"\>Self Posts</a> | '
            + '<a onclick="readyView(\'Subreddits\', \'' + subView + '\', \'link\');"\>Links</a>';

  return title;
}

/* Formats and displays all the data in the overview view */
function displayOverview(Posts){
  toggleFocus(document.getElementById('menu-overview'));

  var trophies = User[0].trophies; 

  var header = '<p class="overview-title">' + User.name + '</p>'
             + '<div id="overview-stats"><p class="overview-stats-title">Quick Stats:</p>'
             + '<table><tr class="overview-details"><td>Comment Karma: </td><td>' + User.commentKarma + ' points</td></tr>'
             + '<tr class="overview-details"><td>Link Karma: </td><td>' + User.linkKarma + ' points</td></tr>' 
             + '<tr class="overview-details"><td>Member since: </td><td>' + User.memberSince.substr(0, 10) + '</td></tr>'
             + '<tr class="overview-details"><td>Post count: </td><td>' + User.postCount + '</td></tr></table></div>';
  
  var trophyText = '';
  if(trophies !== null){
    trophyText += '<div id="trophies"><p class="trophy-title">Trophies:</p>';
 
    for(var i = 0; i < trophies.length; i++){
      trophyText += '<p class="trophy">' + trophies[i] + '</p>';
    }

    trophyText += '</div>';
  }

  var worstTitle = '<div style="clear:both"></div><p class="overview-heading">Post with least karma</p>';
  if(Posts[0] !== undefined){
    var worstPost = formatSinglePost(Posts[0]);
  }
  else{
    var worstPost = '';
  }
  var bestTitle = '<p class="overview-heading">Post with most karma</p>';
  if(Posts[1] !== undefined){
    var bestPost = formatSinglePost(Posts[1]);
  }
  else{
    var bestPost = '';
  }

  document.getElementById('overview-page').innerHTML = header + trophyText + worstTitle + worstPost + bestTitle + bestPost;
  formatTrophies();
}

function formatTrophies(){
  var trophies = User[0].trophies;
  
}

/* Hide the previous view and show the loading overlay */
function showLoadingOverlay(currentViewId){
  document.getElementById('loading-overlay').style.display = 'block';
  document.getElementById(currentViewId).style.display = 'none'; 
  document.getElementById('loading-overlay-status').innerHTML = 'Loading content...';
  document.getElementById('loading-overlay-gif').innerHTML = '<img src="assets/images/loading.gif" />';
}

/* Hide the loading overlay and show the new view */
function hideLoadingOverlay(currentViewId){
  document.getElementById('loading-overlay').style.display = 'none';
  document.getElementById(currentViewId).style.display = 'block';
}

function toggleFocus(currentButton, innerButton){

  Display.previousButton = Display.currentButton;
  Display.currentButton = currentButton; 
  
  if(innerButton !== undefined && innerButton === true){

    Display.subMenuLast = true;

    if(Display.previousButton === undefined){
      Display.currentButton.style.backgroundColor = '#77ad77';
      Display.currentButton.style.Color = '#f9f9f9';
    }
    else if(Display.previousButton === Display.currentButton){
      return false;
    }
    else{
      Display.currentButton.style.backgroundColor = '#77ad77';
      Display.currentButton.style.color = '#f9f9f9';
      Display.previousButton.style.backgroundColor = '';
      Display.previousButton.style.color = '';
    }
  }
  else if(Display.subMenuLast !== undefined && Display.subMenuLast === true){
    Display.subMenuLast = false;
    Display.currentButton.style.backgroundColor = '#77ad77';
    Display.previousButton.style.backgroundColor = '';
    Display.previousButton.style.color = '';
  }
  else{

    if(Display.previousButton === undefined){
      Display.currentButton.style.backgroundColor = '#77ad77';
    }
    else if(Display.previousButton === Display.currentButton){
      return false;
    }
    else{
      Display.currentButton.style.backgroundColor = '#77ad77';
      Display.previousButton.style.backgroundColor = '';
    }
  }
}

/* Draws all charts in the Chart view */
function displayCharts(){
  toggleFocus(document.getElementById('menu-chart'));

  /* Pie Chart */
  var pieData = google.visualization.arrayToDataTable(getPieChartArray());

  var pieOptions = {
    title: 'Subreddit Post Frequency',
    backgroundColor: '#f9f9f9'
  };

  var pieChart = new google.visualization.PieChart(document.getElementById('pie-chart'));
  pieChart.draw(pieData, pieOptions);
  
  /* Column Chart */
  var columnData = google.visualization.arrayToDataTable(getChartArray('column'));

  var columnOptions = {
    title: 'Post Activity by Type (last 12 months)',
    hAxis: {title: '', titleTextStyle: {color: 'red'}},
    backgroundColor: '#f9f9f9'
  };

  var columnChart = new google.visualization.ColumnChart(document.getElementById('column-chart'));
  columnChart.draw(columnData, columnOptions);
  
  /* Area Chart */
  var areaData = google.visualization.arrayToDataTable(getChartArray('area'));

  var areaOptions = {
    title: 'Total Post Activity (last 12 months)',
    hAxis: {title: '',  titleTextStyle: {color: 'red'}},
    backgroundColor: '#f9f9f9'
  };

  var areaChart = new google.visualization.AreaChart(document.getElementById('area-chart'));
  areaChart.draw(areaData, areaOptions);
}
