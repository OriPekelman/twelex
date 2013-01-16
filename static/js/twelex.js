
$(function() {
  window.READQUEUE = function() {
    CHAR = p.ADVANCE();
    if (CHAR != false) {
      $('#typewriter').html($('#typewriter').html() + CHAR["CHAR"]);
      $("#typewriter").animate({top: "-=0.5px"}, {duration: 50, specialEasing: { width: 'linear', height: 'easeOutBounce'}});
      CHARS = CHAR['TTY'].match(/.{1,5}/g); //split to 5 chars chunks. Just in case we got a shift
      for (i = 0; i < CHARS.length; i++) TAPE.unshift(CHARS[i]);
      p.DRAWTAPE("twitter", TAPE);
    } else {
      if (p.AUDIOENABLED == "YES") p.AUDIO.pause();
      if (bzzz) {
        bzzz = false;
        $('#typewriter').html($('#typewriter').html() + "<p>___________________</p>");
        $("#typewriter").animate({top: "-=88px"}, { duration: 150, specialEasing: { width: 'linear', height: 'easeOutBounce' }});
      }
    }
  };
  
  window.p = new TTYPRINTER;
  window.bzzz = false;
  p.ENABLEAUDIO();
  window.TAPE = new Array;

  TIMER = setInterval("READQUEUE()", 250);
  $('#twelex').submit(function() {
    bzzz = true;
    p.ADD_TEXT($("#twelextext").val());
    save_image();
    console.log("called save_image");
    return false;
  });
});

$(function() {
  window.save_image = function() {
    S = new TTYPRINTER;
    S_TAPE = [];
    
    var text_length = $("#twelextext").val().length;
    if (text_length == 0){
	     $('#instructions').html('<span style="opacity:0.8;color:red;font-size:20px">You probably want to write a message. Empty twelexes are a boring thing. And remember this autotweets...</span>');
	      return false;
    };
    S.ADD_TEXT($("#twelextext").val());
    for(SS=0;SS<text_length -1;SS++)
    {
      S_CHAR = S.ADVANCE();
      S_CHARS = S_CHAR['TTY'].match(/.{1,5}/g); //split to 5 chars chunks. Just in case we got a shift
      for (i = 0; i < S_CHARS.length; i++) S_TAPE.unshift(S_CHARS[i]);
    }
    $('#s_image').remove();
    S_CANVAS = document.createElement('canvas');
    S_CANVAS.id = "s_image";
    S_CANVAS.width = 100;
    RADIUS = S_CANVAS.width / 15;
    S_CANVAS.height = RADIUS + S_TAPE.length * RADIUS * 3
    document.body.appendChild(S_CANVAS); 
    S.DRAWTAPE("s_image", S_TAPE, true);
    var DATAURL = S_CANVAS.toDataURL("image/png");
    DATAURL = DATAURL.replace(/^data:image\/(png|jpg);base64,/, "");
    $('#save_image').val(DATAURL); // set the response in text area    
    $.post("/image", $("#image_form").serialize(),function(){
        $('#instructions').html('<span style="opacity:0.8;color:red;font-size:20px">Your Twelex Has been Sent! (So if you click the button again, it will send another tweet...)</span>');
    });
    $('#instructions').html('<span style="opacity:0.6;color:red;font-size:20px">Your Twelex is being sent! (So if you click the button again, it will send another tweet...)</span>');
  }
});