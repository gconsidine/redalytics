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
        <input type="search" placeholder="Search user history" />
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
        <h2>Welcome to Redalytics.</h2>
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
    </div>

    <script src="controller/user.js"></script>
    <script src="controller/request.js"></script>
    <script src="controller/process.js"></script>
    <script src="view/display.js"></script>
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>

    <script type="text/javascript">
      google.load("visualization", "1", {packages:["corechart"]});
    </script>
  </body>
</html>
