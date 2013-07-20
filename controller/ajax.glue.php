<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require_once '../config/config.inc.php';
require_once '../model/user.class.php';

if(!isset($_SESSION))
{
  session_start();
}
if($_SESSION['auth'] !== KEY)
{
  header('Location: https://en.wikipedia.org/wiki/Special:Random');
}

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
