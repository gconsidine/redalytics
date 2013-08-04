<?php
require_once 'config/config.inc.php';

/* Sets an authentication key used in Ajax requests for the session */
if(!isset($_SESSION))
{
  session_start();
}

$_SESSION['auth'] = KEY;
?>

<!doctype HTML>
<html>
  <head>
    <link rel="stylesheet" href="view/redalytics.css">
    <link rel="icon" type="image/png" href="assets/images/favicon.png" />
    <title>Redalytics</title>
  </head>
  <body>
    <div id="post-type"></div>

    <div id="page-container">

      <div id="title-container">
        <a href="http://redalytics.poba.co">Redalytics</a>
        <!--<input type="search" placeholder="Search user history" />-->
      </div>
      
      <div id="side-menu-container">
        <ul class="side-menu">
          <li id="menu-overview"><a onclick="readyView(this.innerHTML);" class="main">Overview</a></li>
          <li id="menu-sub"><a onclick="readyView(this.innerHTML, 'all', 'all');" class="main">Subreddits</a></li>
        </ul>
        <ul id="subreddit-menu"></ul>
        <ul class="side-menu">
          <li id="menu-chart"><a onclick="readyView(this.innerHTML);" class="main">Charts</a></li>
        </ul>
      </div>
      
      <div id="loading-overlay" style="display: none">
        <p id="loading-overlay-gif"></p>
        <p id="loading-overlay-status"></p>
      </div>
      
      <div id="home-page">    
        <h2>Welcome to Redalytics</h2>
        <p id="details">Enter a reddit user name below to get started</p>
        <div id="input">
          <input type="text" id="user-name" maxlength="20" required autofocus onkeypress="keyCheck(event);"/><br />
          <button id="stop-button" onclick="stop();">Stop</button>
          <button id="analyze-button" onclick="prepare();">Analyze</button>
          <p id="error-message"></p>
        </div>

        <div id="status" style="visibility:hidden">
          <p id="post-count"></p>
          <p id="progress-details">Posts analyzed so far...</p>
        </div>

        <div id="explanation">
          <p>How does this work?</p>
          <ul>
            <li>
              Enter reddit user's account name and hit enter or click 'Analyze'.  Redalytics
              scrapes the user's post history and returns the post data back to the browser 
              one page at a time.  To stop this process, hit the 'Stop' button 
              and you'll be able to view the data that has been returned so far.
            </li>
            <li>
              <em>"Do you you do something creepy with my data?"</em> Nope.  I really don't care 
              about your data.  There is no database, no Google Analytics tracking, no record of
              IP addresses, etc.  I just retrieve your post history and hand it off to your browser
              like it's a hot potato.  When you close this tab or reload the page, all information
              is gone and you'll have to 're-analyze' the user if you want to see the data again.
            </li>
            <li>
              <em>"I don't trust you anyway!"</em> You can take a look at the code 
              <a href="https://github.com/gconsidine/redalytics">here.</a>
            </li>
            <li>
              Navigation is sort of wonky given that this is my first attempt at a single-page website. 
              I've chosen to have all reddit links open in a new tab by default, and to
              give the user a warning if he/she attempts to navigate away from the site after 
              spending the time to analyze a user.
            </li>
            <li>
              Have a suggestion?  A criticism?  Find a bug?  <a href="http://poba.co/contact.php">Contact me</a>
              and I'll see what I can do.
            </li>
          </ul>
        </div>
      </div>

      <div id="overview-page"></div>

      <div id="subreddits-page"></div>

      <div id="charts-page">
        <div id="pie-chart"></div>
        <div id="column-chart"></div>
        <div id="area-chart"></div>
      </div>

      <div id="search-page"></div>

      <div style="clear:both"></div>

      <div id="footer">
        <p><a href="http://poba.co">POBAco</a></p>
      </div>
    </div>

    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript">
      google.load("visualization", "1", {packages:["corechart"]});
    </script>
    <script src="controller/request.js"></script>
    <script src="controller/process.js"></script>
    <script src="view/display.js"></script>
  </body>
</html>
