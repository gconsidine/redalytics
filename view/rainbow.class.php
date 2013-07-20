<?php

/*
 * RainbowText
 * Author: Greg Considine
 * Date: December 21st, 2012
 *
 * RainbowText allows the web developer to display text that changes color
 * from one character to the next.  
 * 
 * To use, follow these 4 steps:
 * 
 * 1.) Create an array of hexidecimal colors as strings.  For example,
 *     $colors = array("#f9f9f9", "#cc9f23", "#333444").  The array can
 *     have as many or as few colors as you'd like.
 * 
 * 2.) Create a RainbowText object and call the setColors() method with your
 *     colors array as a parameter.
 * 
 * 3.) Within HTML style tags in the head, call the createCSS() method to 
 *     genereate the necessary CSS for RainbowText to work.
 *
 * 4.) Create a string and pass it in the textToRainbow() method.
 *
 */

class RainbowText
{
  private $colors;

  /*
   * Name:       setColors()
   * Purpose:    Sets the instance variable $colors equal to the array of HTML HEX 
   *             color values passed in the parameter.
   * Parameters: $colors
   * Return:     void
   */
  public function setColors($colors)
  {
    $this->colors = $colors;
  }

  /*
   * Name:       createCSS()
   * Purpose:    Generates CSS code to style the "RainbowText" based on the colors
   *             supplied in the setColors() method.
   * Parameters: None.
   * Return:     void
   */
  public function createCSS()
  {
    for($i = 0; $i < count($this->colors); $i++)
    {
      echo "#color_$i{ color: " . $this->colors[$i] . " } \n";
    }
  }

  /*
   * Name:       textToRainbow()
   * Purpose:    Creates the alternating color text effect using colors 
   *             supplied by the user.  Styling is done using <span>. The 
   *             string supplied by the user is echoed back out 
   *             using the new colors.
   * Parameters: $text 
   * Return:     void
   */
  public function textToRainbow($text)
  {
    $rainbowText = ""; #Rainbowed letters are concatonated to this variable.
    $c = 0; #Count variable to coordinate the styling of letters.

    for($i = 0, $j = strlen($text); $i < $j; $i++)
    {
      if($text[$i] == " ") #Blank spaces aren't given any styling.
      {
        $rainbowText .= $text[$i];
        continue;
      }
      else
      {
        $rainbowText .= "<span id=\"color_" . $c . "\">" . $text[$i] . "</span>";
        $c++;

        #$c is reset back to the first color if the end of the color array is reached.
        if($c >= count($this->colors)) 
        {
          $c = 0;
        } 
      }
    }

    echo $rainbowText;
  }
}

?>
