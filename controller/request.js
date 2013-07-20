/* 
 * Function containing Ajax POST request.  The variable pageType determines
 * the flow of logic -- whether to establish the User object with user
 * account details and then scrape posts, or to just scrape posts of
 * a user's next page of post history.
 */
function getPage(pageType, user, link){
  
  /* Create XMLHttpRequest instance */
  if(window.XMLHttpRequest){
    httpRequest = new XMLHttpRequest();
  }
  else if(window.ActiveXObject){
    try{
      httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
    }
    catch(e){
      try{
        httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
      }
      catch(e){}
    }
  }

  if(!httpRequest){
    console.log('Cannot create an XMLHTTP instance');
    return false;
  }
  
  /* 
   * Set parameters based on whether the PHP script is to scrape the first
   * page of a user's history or a subsequent page of posts
   */
  var params = '';
  httpRequest.onreadystatechange = alertContents;

  if(pageType === 'first'){
    params = 'page=' + pageType + '&user_account=' + user;
      }
  else if(pageType === 'hasNext'){
    params = 'page=' + pageType + '&link=' + link;
  }
  else{
    console.log('There was an error encoutering that page');
  }
  
  /* Make POST request to an intermidiary PHP script */
  httpRequest.open('POST', 'controller/ajax.glue.php');
  httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  httpRequest.send(params);
  
  /* 
   * If the request is successful, then call the appropriate function to process
   * the response based on pageType.
   */
  function alertContents(){
    if(httpRequest.readyState === 4){
      if(httpRequest.status === 200){

        switch(pageType){
          case 'first':
            updateUser(httpRequest.responseText, pageType);
            break;
          case 'hasNext':
            updateUser(httpRequest.responseText);
            break;
          default:
            break;
        }
      }
    } 
  }
}
