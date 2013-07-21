<?php
require_once '../config/config.inc.php';
require_once '../model/user.class.php';

/* 
 * A quick check to see if the authentication key was set at the home page
 * before attempting to access this script.  If the key isn't matched or set,
 * then the user/bot will be directed to a random wikipedia page.
 */
if(!isset($_SESSION))
{
  session_start();
}
if($_SESSION['auth'] !== KEY)
{
  header('Location: https://en.wikipedia.org/wiki/Special:Random');
}

/* 
 * Re-validates the user name upon first call, and gets the first page if
 * user name is valid.  For subsequent pages, validation isn't necessary.
 */
if(isset($_POST['page']))
{
  switch($_POST['page'])
  {
    case 'first':
      if(!validateUserName($_POST['user_account']))
      {
        return false;
      }

      $user = new User();
      $user->scrapeFirstPage($_POST['user_account']);
      break;

    case 'hasNext':
      $user = new User();
      $user->scrapePage($_POST['link']);
      break;

    default:
      break;
  }
}

/* Validates the format of the user name */
function validateUserName($user)
{
  $pattern = '/^[\w-_]{3,20}$/';

  if(preg_match($pattern, $user) === 0)
  {
    return false;
  }
  else
  {
    return true;
  }
}


?>
