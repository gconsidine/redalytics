function displayAllData(){
  console.log(User);
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

function displayProgressDetails(message){
  document.getElementById('progress-details').innerHTML = message;
}

function hideStatus(){
  document.getElementById('status').style.visibility = 'hidden';
}

function displayErrorMessage(message){
  document.getElementById('error-message').innerHTML = message;
  document.getElementById('error-message').style.visibility = 'visible';
}

function displaySubredditMenu(){
  
  var menu = '<table id="sub-menu-table" cellspacing="0">';
  for(var sub in Subreddits){
    menu += '<tr onclick="getView(\'subreddit\', \'' + sub + '\');">'
          + '<td class="sub">' + sub + '</td><td class="count">' + Subreddits[sub] + '</td><tr>';
  }
  menu += '</table>';

  document.getElementById('subreddit-menu').innerHTML = menu;
  document.getElementById('subreddit-menu').style.height = '100%';
}

function hideErrorMessage(){
  document.getElementById('error-message').style.visibility = 'hidden';
}

