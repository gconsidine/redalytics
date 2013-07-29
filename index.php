<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
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
    <!-- target elements to alter URLs onclick -->
    <div id="overview"></div>
    <div id="charts"></div>
    <div id="subreddits"></div>
    <div id="post-type"></div>
    <div id="specific-sub"></div>
    <div id="page-container">

      <!-- Menu -->
      <div id="title-container">
        <a href="../redalytics/">Redalytics</a>
        <p>beta</p>
        <!--<input type="search" placeholder="Search user history" />-->
      </div>
      
      <div id="side-menu-container">
        <ul class="side-menu">
          <li><a onclick="readyView(this.innerHTML);" class="main" href="#overview">Overview</a></li>
          <li><a onclick="readyView(this.innerHTML, 'all', 'all');" class="main" href="#subreddits">Subreddits</a></li>
        </ul>
        <ul id="subreddit-menu"></ul>
        <ul class="side-menu">
          <li><a onclick="readyView(this.innerHTML);" class="main" href="#charts">Charts</a></li>
        </ul>
      </div>
      <!-- End Menu -->
      
      <!-- Loading overlay -->
      <div id="loading-overlay" style="display: none">
        <p id="loading-overlay-gif"></p>
        <p id="loading-overlay-status"></p>
      </div>
      <!-- End loading overlay -->
      
      <!-- Home page -->
      <div id="home-page">    
        <h2>Welcome to Redalytics</h2>
        <p id="details">Enter a reddit user name below to get started.</p>
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
              one page at a time.  To stop this process at any time, hit the 'Stop' button 
              and you'll be able to view the data that has been returned so far.
            </li>
            <li>
              <em>Do you you do something creepy with my data?</em> Nope.  I really don't care 
              about your data.  There is no database, no Google Analytics tracking, no record of
              IP adresses, etc.  I just retrieve your post history and hand it off to your browser
              like it's a hot potato.  When you close this tab or reload the page, all information
              is gone and you'll have to 're-analyze' if you want to see the data again.
            </li>
            <li>
              <em>I don't trust you anyway!</em> If I get enough requests, I'll just open source
              the project so you can see the whole thing for yourself.  I'll do this eventually
              anyway.
            </li>
            <li>
              Navigation is wonky at the moment.  This is my first attempt at a single page website.  
              I'd suggest opening any links you come across in a new tab and avoid using browser navigation.
              Sorry :/ -- I'll fix this when I get a chance.
            </li>
            <li>
              Have a suggestion?  A criticism?  Find a bug?  <a href="http://poba.co/contact.php">Contact me</a>
              and I'll see what I can do.
            </li>
          </ul>
        </div>
      </div>
      <!-- End home page -->

      <!-- Overview page -->
      <div id="overview-page"></div>
      <!-- End overview page -->

      <!-- Subreddits page -->
      <div id="subreddits-page">
      </div>
      <!-- End subreddit page -->

      <!-- Chart page -->
      <div id="charts-page">
        <div id="pie-chart"></div>
        <div id="column-chart"></div>
        <div id="area-chart"></div>
      </div>
      <!-- End chart page -->

      <!-- Search results page -->
      <div id="search-page"></div>
      <!-- End search results page -->

      <!-- Foooter -->
      <div style="clear:both"></div>
      <div id="footer">
        <p><a href="http://poba.co">POBAco</a></p>
      </div>
      <!-- End footer -->
    </div>

    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script type="text/javascript">
      google.load("visualization", "1", {packages:["corechart"]});
    </script>
    <script src="controller/user.js"></script>
    <script src="controller/request.js"></script>
    <script src="controller/process.js"></script>
    <script src="view/display.js"></script>
  </body>
</html>
