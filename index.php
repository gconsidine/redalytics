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
    <div id="page-container">
      
      <!-- Menu -->
      <div id="title-container">
        <a href="index.php">Redalytics</a>
        <input type="search" placeholder="Search user history" />
      </div>
      
      <div id="side-menu-container">
        <ul class="side-menu">
          <li onclick="readyView(this.innerHTML);">Overview</li>
          <li onclick="readyView(this.innerHTML, 'all');">Subreddits</li>
        </ul>
        <ul id="subreddit-menu"></ul>
        <ul class="side-menu">
          <li onclick="readyView(this.innerHTML);">Charts</li>
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
      <div id="chart-page"></div>
      <!-- End chart page -->

      <!-- Search results page -->
      <div id="search-page"></div>
      <!-- End search results page -->
      
      <div id="footer">
        <p><a href="http://poba.co">POBAco</a></p>
      </div>
    </div>

    <script src="controller/user.js"></script>
    <script src="controller/request.js"></script>
    <script src="controller/process.js"></script>
    <script src="view/display.js"></script>
  </body>
</html>
