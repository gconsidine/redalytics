<?php
include_once '../libraries/simple_html_dom.php';

/* Contains a user's data while a user's post history page is being scraped. */
class User
{
  private $html;
  private $name;
  private $linkKarma;
  private $commentKarma;
  private $trophies;
  private $memberSince;
  private $postCount;
  private $allPosts;
  private $linkToNextPage;
  
  /* 
   * Attempts to scrape the user's first page of post history.  If the user
   * doesn't exist, then the scraper won't continue.
   */
  public function scrapeFirstPage($name)
  {
    $this->name = $name;
    $url = 'http://www.reddit.com/user/' . $this->name;
    $this->html = new simple_html_dom(); 
    
    if($this->urlExists($url))
    {
      $this->html->load_file('http://www.reddit.com/user/' . $this->name);
    }
    else
    {
      echo '{"userExists" : false}';
      return false;
    }

    $firstPage = true;
    $this->getUserInfo();
    $this->getPageData();
    $this->getLinkToNextPage($firstPage);
    $this->returnUpdate($firstPage);
  }
  
  /* 
   * Scrapes relevant information on the page and returns the link to the
   * next page of posts if it exists.
   */
  public function scrapePage($link)
  {
    $link = urldecode($link);
    $this->html = new simple_html_dom();
    $this->html->load_file($link);

    $this->getPageData();
    $this->getLinkToNextPage();
    $this->returnUpdate();
  }
  
  /* 
   * Specific user info is present only on the first page, stuff like 
   * trophies, total link karma, and total comment karma. This is only called
   * once.
   */
  private function getUserInfo()
  {
    $this->linkKarma = $this->html->find('.karma', 0)->innertext;
    $this->commentKarma = $this->html->find('.comment-karma', 0)->innertext;

    foreach($this->html->find('.trophy-name') as $trophy)
    {
      $this->trophies[] = $trophy->innertext;
    }
    
    foreach($this->html->find('.age') as $age)
    {
      $pattern = '(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})';
      preg_match($pattern, $age->innertext, $matches);
      $this->memberSince = $matches[0];
    }
  }
  
  /*
   * Scrapes over a user's page of post history post by post.  Depending on
   * what kind of post is being scraped (link, self, comment), a particular 
   * function is called to gather the relevant information.
   */
  private function getPageData()
  {
    foreach($this->html->find('#siteTable') as $table)
    {
      foreach($table->find('.thing') as $thing)
      {
        if(preg_match('(comment)', $thing->class))
        {
          $this->getComment($thing);
        }
        else if(preg_match('(self)', $thing->class))
        {
          $this->getSelfPost($thing);
        }
        else if(preg_match('(link)', $thing->class))
        {
          $this->getLinkPost($thing);
        }

        $this->postCount++;
      }
    }
    
    $this->pageCount++;
    $this->getLinkToNextPage();
  }
  
  /* Scrapes a 'comment' post and adds relevant data to an array */
  private function getComment($comment)
  {
    $post = array();

    foreach($comment->find('.parent') as $p)
    {
      $post['postType'] = 'comment';

      if($p->find('.title', 0))
        $post['title'] = $p->find('.title', 0)->outertext;
      if($p->find('.author', 0))
        $post['author'] = $p->find('.author', 0)->innertext;
      if($p->find('.subreddit', 0))
        $post['subreddit'] = $p->find('.subreddit', 0)->innertext;
    }
    foreach($comment->find('.md') as $md)
    {
      if($md->find('p', 0))
        $post['userComment'] = $md->find('p', 0)->innertext;
    }
    foreach($comment->find('.first') as $first)
    {
      if($first->find('a', 0))
        $post['fullComments'] = $first->find('a', 0)->outertext;
    }
    
    if($comment->find('.score', 1))
      $post['karma'] = $comment->find('.score', 1)->innertext;
    if($comment->find('time', 0))
      $post['time'] = $comment->find('time', 0)->datetime;
    
    $this->allPosts[] = $post;
  }
  
  /* Scrapes a self post */
  private function getSelfPost($self)
  {
    $post = array();

    foreach($self->find('.midcol') as $midcol)
    {
      $post['postType'] = 'submission';
      $post['comment'] = null;

      if($midcol->find('.score', 1))
        $post['karma'] = $midcol->find('.score', 1)->innertext;
    }
    foreach($self->find('.entry') as $entry)
    {
      foreach($entry->find('.title') as $title)
      {
        if($title->find('a', 0))
          $post['title'] = $title->find('a', 0)->outertext;
      }
      foreach($entry->find('.flat-list') as $flat)
      {
        foreach($flat->find('.first') as $first)
        {
          if($first->find('a', 0))
            $post['fullComments'] = $first->find('a', 0)->outertext;
        }
      }
      foreach($entry->find('.tagline') as $tagline)
      {
        if($tagline->find('time', 0))
          $post['time'] = $tagline->find('time', 0)->datetime;
        if($tagline->find('.author', 0))
          $post['author'] = $tagline->find('.author', 0)->innertext;
        if($tagline->find('.subreddit', 0))
          $post['subreddit'] = $tagline->find('.subreddit', 0)->innertext;
      }
    }
    
    $this->allPosts[] = $post;
  }
  
  /* Scrapes a 'link' post.  Also grabs thumbnail link */
  private function getLinkPost($link)
  {
    $post = array();

    foreach($link->find('.midcol') as $midcol)
    {
      $post['postType'] = 'link';
      $post['comment'] = null;

      if($midcol->find('.score', 1))
        $post['karma'] = $midcol->find('.score', 1)->innertext;
    }
    foreach($link->find('p.title') as $title)
    {
      if($title->find('a.title', 0))
        $post['title'] = $title->find('a.title', 0)->outertext;
    }
    foreach($link->find('.flat-list') as $flat)
    {
      foreach($flat->find('.first') as $first)
      {
        if($first->find('a', 0))
          $post['fullComments'] = $first->find('a', 0)->outertext;
      }
    }
    foreach($link->find('.tagline') as $tagline)
    {
      if($tagline->find('time', 0))
        $post['time'] = $tagline->find('time', 0)->datetime;
      if($tagline->find('.author', 0))
        $post['author'] = $tagline->find('.author', 0)->innertext;
      if($tagline->find('.subreddit', 0))
        $post['subreddit'] = $tagline->find('.subreddit', 0)->innertext;
    }
    
    if($link->find('.thumbnail', 0))
      $post['thumbnail'] = $link->find('.thumbnail', 0)->outertext;

    $this->allPosts[] = $post;

  }
  
  /* 
   * Grabs the link to the next page of posts, or leaves the linkToNextPage
   * variable set to null
   */
  private function getLinkToNextPage($firstPage = false)
  {
    $this->linkToNextPage = null;
    
    if($firstPage)
    {
      if($this->html->find('.nextprev'))
      {
        foreach($this->html->find('.nextprev') as $nextprev)
        {
          $this->linkToNextPage = urlencode($nextprev->find('a', 0)->href);
        }
      }
    }
    else
    {
      foreach($this->html->find('.nextprev') as $nextprev)
      {
        if($nextprev->find('a', 1))
        {
          $this->linkToNextPage = urlencode($nextprev->find('a', 1)->href);
        }
      }
    }
  }
  
  /* Combines all of the scraped data and echos it back to JavaScript */
  private function returnUpdate($firstPage = false)
  {
    if($firstPage)
    {
      $user = array(
        'name' => $this->name,
        'linkKarma' => $this->linkKarma,
        'commentKarma' => $this->commentKarma, 
        'memberSince' => $this->memberSince,
        'postCount' => $this->postCount,
        'link' => $this->linkToNextPage
      );

      $allData = array_merge($this->allPosts, $user, array('trophies' => $this->trophies));
      echo json_encode($allData);
    }
    else
    {
      $user = array(
        'link' => $this->linkToNextPage,
        'postCount' => $this->postCount
      );

      $allData = array_merge($this->allPosts, $user);
      echo json_encode($allData);
    }
  }
  
  /* Check to see if the URL exists before attempting to scrape it */
  private function urlExists($url)
  {
    $headers = get_headers($url);

    if(is_array($headers))
    {
      if(strpos($headers[0], '404 Not Found'))
        return false;
      else
        return true;
    }
    else
      return false;
  }
}

?>
