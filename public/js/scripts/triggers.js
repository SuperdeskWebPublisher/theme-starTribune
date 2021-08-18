// accordion

$(document).ready(function() {
$('#nav-main').okayNav();
$('#topics').okayNav();

  function close_accordion_section() {
    jQuery('.accordion .accordion__sectionTitle').removeClass('active');
    jQuery('.accordion .accordion__sectionContent').slideUp(300).removeClass('open');
  }

  jQuery('.accordion__sectionTitle').click(function(e) {
    // Grab current anchor value
    var currentAttrValue = jQuery(this).attr('href');

    if(jQuery(e.target).is('.active')) {
      close_accordion_section();
    }else {
      close_accordion_section();

      // Add active class to section title
      jQuery(this).addClass('active');
      // Open up the hidden content panel
      jQuery('.accordion ' + currentAttrValue).slideDown(300).addClass('open'); 
    }

    e.preventDefault();
  });

  /** USER MANAGEMENT **/
  /* LOGIN USER */

  $('#loginform').submit(function(event) {
    // Stop form from submitting normally
    event.preventDefault();
          
    var $inputs = $('#loginform :input');
    var values = {};
    $inputs.each(function() {
      values[this.name] = $(this).val();
    });

    var username = values["_username"];
    var password = values["_password"];
    var data = {'auth': {'username': username, 'password': password}},
        url = "/app_dev.php/api/v1/auth/";

    var posting = $.post( url, data );  

    posting.done(function( data ) {
      var content = $( data ); 
          apiKey = content["0"]["token"]["api_key"];
          userId = content["0"]["user"]["id"];
          sessionStorage.setItem('auth_token', apiKey);
          sessionStorage.setItem('user_id', userId);
      $.post($('#loginform').attr('action'),  {'_username': username, '_password': password}).done(function (done) {location.reload()});
    });

    // If posting is unsuccessful, then:
    posting.fail(function(xhr) {
      var content = $.parseJSON( xhr.responseText );
      var para = document.createElement("p");
      var head = document.createElement("h5");
      var nodeH5 = document.createTextNode( "Error code " + content.code + ":" );
      var nodeP = document.createTextNode( content.message );
      para.appendChild(nodeP);
      head.appendChild(nodeH5);    
      $( "#userAuth" ).empty().append( head, para );          
    });
  });

  /* REGISTER USER */

  // Attach a submit handler to the form
  $( "#registerForm" ).submit(function( event ) {
    // Stop form from submitting normally
    event.preventDefault();

    // Get some values from elements on the page:
    var $form = $( this ),
        email = $form.find( "input[name='_email']" ).val(),
        username = $form.find( "input[name='_username']" ).val(),
        password = $form.find( "input[name='_password']" ).val(),
        password2 = $form.find( "input[name='_password2']" ).val(),
        url = $form.attr( "action" );
    data = {'user_registration': { 'email': email, 'username' : username, 'plainPassword' : { 'first' : password, 'second' : password2 }}};

    // Send the data using post
    var posting = $.post( url, data );

    // Put the results in a div
    posting.done(function( data ) {
      var content = $(  data );
      //var para = document.createElement("p");
      //var nodeP = document.createTextNode( content );
      //para.appendChild(nodeP);        
      $( "#registrationResult" ).empty().append( content ); 
    }); 

    // If posting is unsuccessful, then:
    posting.fail(function(xhr) {
      var content = $.parseJSON( xhr.responseText );
      var para = document.createElement("p");
      var head = document.createElement("h5");
      var nodeH5 = document.createTextNode( "Error code " + content.code + ":" );
      var nodeP = document.createTextNode( content.message );
      para.appendChild(nodeP);
      head.appendChild(nodeH5);    
      var element = document.getElementById("registrationResult");
      $( "#registrationResult" ).empty().append( head, para ); 
    });
  }); 

  /* LOAD USER PROFILE */

  var authToken = sessionStorage.getItem('auth_token');
  var userId = sessionStorage.getItem('user_id');
  if (authToken) {
    $.ajax({
      headers : {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json',
        'Authorization' : authToken
      },
      url : "/app_dev.php/api/v1/users/profile/" + userId,
      type : 'GET',
      dataType : 'json',
      data : JSON.stringify({ 'Authorization': authToken }),
      success : function(response, textStatus, jqXhr) {
        var user = response;
        document.getElementById("_usernameP").setAttribute("value", user["username"]);
        document.getElementById("_emailP").setAttribute("value", user["email"]);
        if(user["firstName"]){
          document.getElementById("_fnameP").setAttribute("value", user["firstName"]);
        };
        if(user["lastName"]){
          document.getElementById("_lnameP").setAttribute("value", user["lastName"]);
        };
        if(user["about"]){
          document.getElementById("_aboutP").setAttribute("placeholder", user["about"]);
        };                
      },
      error : function(jqXHR, textStatus, errorThrown) {
        console.log("Error getting user profile");
      }
    });
  };

  /* EDIT USER PROFILE */

  $('#editProfile').submit(function(event) {
    // Stop form from submitting normally
    event.preventDefault();
    // Get updated values from the form:
    var $form = $( this ),
        username = $form.find( "input[name='_username']" ).val(),
        email = $form.find( "input[name='_email']" ).val(),
        firstName = $form.find( "input[name='_fname']" ).val(),
        lastName = $form.find( "input[name='_lname']" ).val(),
        about = $form.find( "textarea[name='_about']" ).val(),
        password = $form.find( "input[name='_password']" ).val(),
        password2 = $form.find( "input[name='_password2']" ).val();
             
    $.ajax({
      headers : {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json',
        'Authorization' : authToken
      },
      url : "/app_dev.php/api/v1/users/profile/" + userId,
      type : 'PATCH',
      dataType : 'json',
      data : JSON.stringify({'user_profile': { 'email': email, 'username' : username, 'firstName' : firstName, 'lastName' : lastName, 'about' : about,  'plainPassword' : { 'first' : password, 'second' : password2 }}}),
      success : function(response, textStatus, jqXhr) {
        var head = document.createElement("h5");
        var nodeH5 = document.createTextNode( "Your user profile was successfuly saved." );
        head.appendChild(nodeH5);
        //var element = document.getElementById("editProfileResult");
        $( "#editProfileResult" ).empty().append( head ); 
      },
      error : function(jqXHR, textStatus, errorThrown) {
        var para = document.createElement("p");
        var head = document.createElement("h5");
        var nodeH5 = document.createTextNode( "Error occured:" );
        var nodeP = document.createTextNode( textStatus +  errorThrown ); 
        para.appendChild(nodeP);
        head.appendChild(nodeH5);
        var element = document.getElementById("editProfileResult");
          $( "#editProfileResult" ).empty().append( head, para );   
      }
    });
  }); 

/* END USER MGMNT */

// slideshow gallery

    var gallery = $('#imageGallery').lightSlider({
        gallery: true,
        rtl: true,
        item: 1,
        loop: true,
        thumbItem: 12,
        slideMargin: 0,
        controls: true,
        enableDrag: true,
        currentPagerPosition:'left',
        onAfterSlide: function (el) {
          changeCaptionAndUrl();
          console.log("onAfterSlide");
        },
        onSliderLoad: function(el) {
          //Assigning numbers and url to thumbnails          
          $('.gallery--fullScreenWrap .lSGallery li').each(function(){
            var url = window.location.origin + window.location.pathname;
            $(this).find('a').attr('href', url + '?slika=' + parseInt($(this).index() + 1));
          });

          // Cloning and matching caption in the sidebar on slider load
          var activeCaption = $('.lslide.active p').clone();
          $('#clonedCaption').html(activeCaption);
          
          console.log("onSliderLoad");
        }
    });

    if(urlImageNo) gallery.goToSlide(parseInt(urlImageNo))

});
