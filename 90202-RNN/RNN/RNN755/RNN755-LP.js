/*jslint browser:true, devel:true, vars:true*/
/*-W020*/
/*global $, whatAgent, TweenMax, urlObject, watchTasks, WATCH */
function app() {
     'use strict';

     var sR, //scroll function
          wX = $(window).width(), //window width
          wY = $(window).height(), //window height
          dX = $("html").width(), //document width
          dY = $("html").height(), //document height
          sP = 0,     //scroll percent
          sF = $(window).scrollTop(), //fixed scroll value in px
          fl = {},   //flag object - store true/false logic in here
          rD = $("html"), //makes scroll function easier
          rW = $(window), //makes scroll function easier
          stopResize, //helps js know when user stops resizing
          hash = window.location.hash.substr(1) || false, //current hash from url
          srv = {},   //holds survey field names
          agt = whatAgent(), //stores logic related to user agent string
          svars = {}, //stores variables for the scroll function
          ls = {},    //stores local storage config options
          url = urlObject(),
          param = url.parameters,
          timeonsite;

     agt.ie8 = ($('.ie8').length === 1) ? true : false; //uses conditional logic and element on page, ie8 requires '=== 1' to be true
     agt.ie9 = $('.ie').length === 1 ? true : false; //uses conditional logic and element on page
     fl.form = $('form').length ? $('form') : false;
     fl.layout = $('#fixed').length ? 'fluid' : 'fixed'; //fluid layout has a container tag for the header logo
     fl.specDisabled = true;
     fl.choosen = (agt.ios) ? false : true; //allows future additions to logic with minimal changes
     fl.rh = false; //used for 991px or less reseting height attributes
     fl.IE8done = false;
     fl.stickymenu = false;
     fl.dev = !$('#development').length ? true : false;
     svars.compatible = ((!agt.ie8 && !agt.ios) && (wX > 991 && wY > 400)) ? true : false;
     ls.timeStore = (3600000); //store local data for an hour
     ls.enabled = $.jStorage ? true : false;

Object.toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
}

    // Console.log Fix for IE8,FF3.0,etc
     if (!window.console || !window.console.log || !window.console.info) {
          window.console = {};
          window.console.log = function () {};
          window.console.info = function () {};
     }

//Helpful Functions
     //Send User To Pages
     function redirect(u) {location.replace(u); } //force navigate
     function changePage(u) {location.href = u; } //event based navigate

     //Random Number Generator
     function getRandom(min, max) {return Math.floor(Math.random() * (max - min + 1) + min); }

     //String Helpers
     function trim(s) {return $.trim(s); }
     function toProperCase(s) {if (s) {return s.toLowerCase().replace(/^(\S)|\s(\S)/g, function ($1) {return $1.toUpperCase(); }); } }
     function toTitleCase(s) {if (s) {return s.replace(/\w\S*/g, function (t) {return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase(); }); } }
     function hasWhiteSpace(s) {if (s) {return s.indexOf(' ') >= 0; } }

     //Logical helpers
     function hasValidValue(v) {if (v) {return true; } return false; }

     /* selectively show/hide form */
     function prefillForm() {
	  var temp;

          if(typeof param.fnm !== 'undefined'){
               temp = decodeURI(param.fnm);
               //temp = temp ? temp : '';

               $('p > span[data-param=first-name]').text(temp + ',');
               $('h3 > span[data-param=first-name]').text(temp);
               $('input[name=candidate_first_name]').val(temp);
          }
          if(typeof param.lnm !== 'undefined'){
               $('span[data-param=last-name]').text(decodeURI(param.lnm));
               $('input[name=candidate_last_name]').val(decodeURI(param.lnm));
          }
          if(typeof param.eml !== 'undefined'){
               $('input[name=EmailAddress]').val(decodeURI(param.eml));
          }
          if(typeof param.specialty !== 'undefined'){
               $('span[data-param=specialty]').text(decodeURI(param.specialty));
          } 
          if(typeof param.sitespecialty !== 'undefined'){
               $('select[name=candidate_specialty]').val(decodeURI(param.sitespecialty));
          } 
          if(typeof param.phn !== 'undefined'){
               $('input[name=candidate_phone]').val(decodeURI(param.phn));
          }
          if (param.sitespecialty) {$('[name=candidate_specialty_check]').click(); }
     }

     //build URL with dynamic pieces
     function submitURL() {
          var page = "http://pages.rnnetworkinfo.com/RNN-Thank-You-2015/",
               query = "?source=" + param.source;

          if (param.specialty) {query = query + "&specialty=" + decodeURI(param.specialty); }
          if (param.sitespecialty) {query = query + "&sitespecialty=" + decodeURI(param.sitespecialty); }
          if (param.sitespecialtytype) {query = query + "&sitespecialtytype=" + decodeURI(param.sitespecialtytype); }

          page = page + query;
          return page;
     }

    
     //Longer first load, shorter second load - expecting cached files for secondary load
     if (!$.jStorage.get('visited_before')) {
          setTimeout(function () {
               $('#blockscreen').fadeOut(900);
               $.jStorage.set('visited_before', 'true', {TTL: 3600000});
          }, 2222);
     } else {$('#blockscreen').fadeOut(250); }




//Custom Fields and Validations
    //Grab Proper Names for Validation Messages and Populate Hidden fields for labeling questions to list in ET
     function getSurveyName(obj) {
          var name, proper, label;
          if ($(obj).length) {
               name = $(obj).attr('name');
               proper = $(obj).attr('data-name');
               $(obj).attr('placeholder', proper);
               //$(obj).before('<label for="' + name + '">' + proper + '</label>');
               label = "label_" + name.slice(-2);
               $('form').append('<input type="hidden" name="' + label + '" value="' + proper + '" />');
               return proper;
          }
     }

    //adds error class if there happens to be an error
     function testDropdown(n, v) {
          //if (!v) {v = null; }
          if ($(n).hasClass('error')) {return $(n + ' + .chosen-container').addClass('error'); }
          $(n + ' + .chosen-container').removeClass('error');
     }

     //custom validation: obj: form field, cb: hidden checkbox, flag: specifies type
     function initDropdown(obj, cb, flag) {
          if (agt.ios || !$(obj).length || agt.ie9) {return; }
          
          //$('form').append('<input type="checkbox" class="offscreen" name="' + cb + '" value="true">');

          if (flag) {
               $(obj).chosen({search_contains: true}).change(function () {
                    $(this).removeClass('error');
               });
          } else {
               $(obj).chosen().change(function () {$(this).removeClass('error'); });
          }

          $(obj).on('change', function () {$('[name=' + cb + ']').prop("checked", true); });

          testDropdown(obj);
          
          setTimeout(function () {
               $(obj).attr('style', 'display:block!important').addClass('offscreen');
          }, 1000);

     }

     //Initialize chosen plugin, onchange events, and hidden checkboxes, Proper SurveyNames
     function initControls() {
          initDropdown("[name=candidate_specialty]", "candidate_specialty_check");
     }


//Local Storage
    //index of local storage - safe
     function iLS() {
          if (!ls.enabled) {return; } //prevents errors
          var index = $.jStorage.index(), i, v = [], val, type;

          if (index[0]) {
               for (i = 0; i < index.length; i += 1) {
                    v[i] = index[i] + ': ' + $.jStorage.get(index[i], "No Value Set");
                    val = $('input[name=' + index[i] + '],select[name=' + index[i] + ']').val();
                    type = $('input[name=' + index[i] + '],select[name=' + index[i] + ']').attr('name');

                    if (!val) {
                         $('input[name=' + index[i] + '],select[name=' + index[i] + ']').val($.jStorage.get(index[i], ""));
                    }
               }
          } else {
               v[0] = 'Nothing Stored';
          }

          console.info('** Local Storage:\n************************************************\n' + $.trim(v.join('\n')) + '\n************************************************');
     }

     //set longterm storage - safe
     function slLS(k, v) {
          if (!ls.enabled) {return; } //prevents errors
          $.jStorage.set(k, v);
     }

     //set local storage - safe
     function sLS(k, v) {
          if (!ls.enabled) {return; } //prevents errors

          //set value (v) for key (k), expires after ls.timeStore (see above)
          $.jStorage.set(k, v, {TTL: ls.timeStore});
     }

     //get local storage
     function gLS(k, d) {
          //prevents errors
          if (!ls.enabled) {return; }

          //get key (k), if no value, return default (d)
          $.jStorage.get(k, d);
     }

     //Set Custom Thank You Page to local storage
     function sTYLS() {
          //prevents errors
          if (!ls.enabled) {return; }
          if (url.pathname.indexOf("thank") < 0) {
               sLS('ty-header', $('#thank-you-custom-text').attr('data-header'));
               sLS('ty-body', $('#thank-you-custom-text').attr('data-body'));
               sLS('ty-url', $('#thank-you-custom-text').attr('data-url'));
               sLS('ty-cta', $('#thank-you-custom-text').attr('data-cta'));
               sLS('ty-phone', $('#thank-you-custom-text').attr('data-phone'));
               sLS('ty-phone-text', $('#thank-you-custom-text').attr('data-phone-text'));
               sLS('ty-alt-phone', $('#thank-you-custom-text').attr('data-alt-phone'));
               sLS('ty-alt-phone-text', $('#thank-you-custom-text').attr('data-alt-phone-text'));
          }
     }

     //Get Custom Thank You Page to local storage
     function gTYLS() {
          //prevent errors and mishaps
          if (!ls.enabled) {return; }
          if (url.pathname.indexOf("thank") < 0) {return; }
          console.log('thankyou');
          //code here
     }

     //Remove all Local Stored Variables and Wipe Form
     function resetForm() {
          if (ls.enabled) {$.jStorage.flush(); } //kill localstorage, if exists
          $('form').trigger("reset"); //kill all form values
          sTYLS(); //get custom Thankyou page vars
     }

     //Pull Params into Form Fields from URL
     if (fl.form) {prefillForm(); }

     //Allow Analytics to see page title, but swap to a readable format before user notices
     function pageTitleChange() {
          if ($('h1').length) {document.title = $('h1:first').text(); } else if ($('h2').length) {document.title = $('h2:first').text(); } else if ($('h3').length) {document.title = $('h3:first').text(); } else {return; }
     }

     //Put Analytics into form field
     function putAnalytics() {
          var prop, hold = '';

          //check if field exists and create if does not exist
          if ($('input[name=a_user_agent').length !== 1) {hold += '<input name="a_user_agent" type="hidden">'; }
          if ($('input[name=a_time_on_site').length !== 1) {hold += '<input name="a_time_on_site" type="hidden">'; }
          if ($('input[name=a_screen_res').length !== 1) {hold += '<input name="a_screen_res" type="hidden">'; }
          if ($('input[name=a_visited_before').length !== 1) {hold += '<input name="a_visited_before" type="hidden">'; }
          if ($('input[name=a_loaded_source').length !== 1) {hold += '<input name="a_loaded_source" type="hidden">'; }
          if ($('input[name=pagetype').length !== 1) {hold += '<input name="pagetype" type="hidden" val="L">'; }
          if ($('input[name=a_zip_code').length !== 1) {hold += '<input name="a_zip_code" type="hidden" val="L">'; }
          $('form').append(hold);

          //specify that the visitor has been here before
          slLS("a_visited_before", "true");

          //get the current user agent
          for (prop in agt) {
               if (agt.hasOwnProperty(prop) && agt[prop]) {
                    $('input[name=a_user_agent').val(prop);
               }
          }

          //place the current screen resolution
          $('input[name=a_screen_res').val(wX + 'x' + wY);

          if (!$('input[name=a_loaded_source]').val()) {
               $('input[name=a_loaded_source]').val(url.parameters.source || $('input[name=cid]').val());
          }
     }

    //Put time on site into form field
     function timeOnSite() {
          timeonsite += 1;
          $('input[name=a_time_on_site]').val(timeonsite);
     }

//Loader Bundle
    //Load Page and Features - Collection of Small Features
     function loadApp() {
          var temp;

          //Remove Load screen
          function hideLoadScreen() {$('#loadscreen').hide(); }
          if (agt.ios) {hideLoadScreen(); } else {
               //Fade Out Loadscreen, Fade In Page Elements
               $('#header-logo,aside .padding,article').attr('style', 'opacity:0');
               TweenMax.to($('#loadscreen'), 1.2, {css: {top: '100%'}, ease: "Circ.easeOut", onComplete: hideLoadScreen });
               TweenMax.staggerTo($('#header-logo,aside .padding,article'), 0.5, {css: {opacity: 1}, ease: "Power1.easeIn"}, 0.5);
          }

          //Support IE8
          if (agt.ie8) {
               $('body').attr('id', '');
               $('footer, footer *').attr('style', 'background-color:#D4D4D4 !important');
          }

          //Support Design Choices
          if (fl.form && $('.chosen-choices').length) {$('.chosen-choices').addClass('shadow'); }

          //Human Friendly Titles
          setTimeout(function () {pageTitleChange(); }, 700);

          //Analytics
          putAnalytics();
          sTYLS();
          gTYLS();
     }


//Resize Events
     //Resize Stop Event, tasks that adjust after a resize only
     function resized() {
     //console.log(wX, wY);
          if (!agt.ios) {
               var w, mw;
               w = $('input[name=candidate_email]').outerWidth();
               mw = $('aside form').innerWidth()  - 50;
               $('input[type=text],.chosen-container').attr('style', 'width:' + mw + 'px');
          }
     }

//Form Validation
     function formValidation() {
          //Skips this block of code if the page has no form
          if (!fl.form) {return; }
          if (!$('#errorbox').length) {
               $('body').append('<div class="modal fade" id="validatorModal" tabindex="-1" role="dialog" aria-labelledby="validatorModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">Please ensure all fields have been filled out.</h4></div><div class="modal-body" id="errorbox"><h5>The Following Items Need to be Corrected:</h5><ul></ul></div><div class="modal-footer"><button type="button" class="btn btn-danger btn-sm" data-dismiss="modal" style="background-color:#f6861f;border-color:#f6861f;">Close</button></div></div></div></div>');
          }

          /* Validator Additional Functions */
          $.validator.addMethod("zipcodeUS", function (v, e) {return this.optional(e) || /\d{5}-\d{4}$|^\d{5}$/.test(v); }, "Please input a valid US ZIP Code");
          $.validator.addMethod("phoneUS", function (num, e) {num = num.replace(/\s+/g, ""); return this.optional(e) || (num.length > 9 && num.match(/^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/)); }, "Please specify a valid phone number");

          //Proper Names from HTML attribute (data-name)
          srv.q1 = getSurveyName('[name=survey_01]');
          srv.q2 = getSurveyName('[name=survey_02]');
          srv.q3 = getSurveyName('[name=survey_03]');
          srv.q4 = getSurveyName('[name=survey_04]');
          srv.q5 = getSurveyName('[name=survey_05]');
          srv.q6 = getSurveyName('[name=survey_06]');
          srv.q7 = getSurveyName('[name=survey_07]');
          srv.q8 = getSurveyName('[name=survey_08]');
          srv.q9 = getSurveyName('[name=survey_09]');
          srv.q10 = getSurveyName('[name=survey_10]');

          //style the input fields
          $('input[type=text]').addClass('shadow');

          //actual validation event
          $('form').validate({
               //these auto detect if the field actually exists, this means it is safe to have more than needed
               rules: {
                    // Standard Input Validation
                    candidate_first_name: {required: true},
                    candidate_last_name: {required: true},
                    EmailAddress: {required: true, email: true},
                    candidate_phone: {required: true, phoneUS: true},
                    candidate_profession: {required: true},
                    candidate_specialty: {required: true},
                    candidate_jobtype: {required: true},
                    //candidate_rep_email: {required: true},
                    referral_first_name: {required: true},
                    referral_last_name: {required: true},
                    referral_email: {required: true, email: true},
                    referral_phone: {required: true, phoneUS: true},
                    referral_profession: {required: true},
                    referral_specialty: {required: true},

                    // Standard Chosen Dropdown Validation
                    candidate_profession_check: {required: true},
                    candidate_specialty_check: {required: true},
                    candidate_jobtype_check: {required: true},
                    referral_profession_check: {required: true},
                    referral_specialty_check: {required: true},

                    // Custom Input Field Validation
                    survey_01: {required: true},
                    survey_02: {required: true},
                    survey_03: {required: true},
                    survey_04: {required: true},
                    survey_05: {required: true},
                    survey_06: {required: true},
                    survey_07: {required: true},
                    survey_08: {required: true},
                    survey_09: {required: true},
                    survey_10: {required: true},

                    // Custom Chosen Dropdown Validation
                    survey_01_check: {required: true},
                    survey_02_check: {required: true},
                    survey_03_check: {required: true},
                    survey_04_check: {required: true},
                    survey_05_check: {required: true},
                    survey_06_check: {required: true},
                    survey_07_check: {required: true},
                    survey_08_check: {required: true},
                    survey_09_check: {required: true},
                    survey_10_check: {required: true}
               },

               //these override the default, some of the default text is poor
               messages: {
                    // Standard Input Error Messages
                    candidate_first_name: {required: "Your First Name is Required."},
                    candidate_last_name: {required: "Your Last Name is Required."},
                    EmailAddress: {required: "Your Email Address is Required.", email: "Please Provide a Valid Email."},
                    candidate_phone: {required: "Your Phone Number is Required.", phoneUS: "Please Provide a Valid US Phone Number."},
                    candidate_profession: {required: "Your Profession is Required."},
                    candidate_specialty: {required: "Your Specialty is Required."},
                    candidate_jobtype: {required: "Your Job Type Preference is Required."},
                    //candidate_rep_email: {required: "Your Rep's Email Address is Required."},
                    referral_first_name: {required: "Referral First Name is Required."},
                    referral_last_name: {required: "Referral Last Name is Required."},
                    referral_email: {required: "Referral Email Address is Required.", email: "Please Provide a Valid Email."},
                    referral_phone: {required: "Referral Phone Number is Required.", phoneUS: "Please Provide a Valid US Phone Number."},
                    referral_profession: {required: "Referral Specialty is Required."},
                    referral_specialty: {required: "Referral Profession is Required."},

                    // Standard Chosen Dropdown Error Messages
                    candidate_specialty_check: {required: "Your Specialty is Required."},
                    candidate_profession_check: {required: "Your Profession is Required."},
                    candidate_jobtype_check: {required: "Your Job Type Preference is Required."},
                    referral_specialty_check: {required: "Referral Specialty is Required."},
                    referral_profession_check: {required: "Referral Profession is Required."},

                    // Custom Input Field Validation
                    survey_01: {required: srv.q1 + " is Required."},
                    survey_02: {required: srv.q2 + " is Required."},
                    survey_03: {required: srv.q3 + " is Required."},
                    survey_04: {required: srv.q4 + " is Required."},
                    survey_05: {required: srv.q5 + " is Required."},
                    survey_06: {required: srv.q6 + " is Required."},
                    survey_07: {required: srv.q7 + " is Required."},
                    survey_08: {required: srv.q8 + " is Required."},
                    survey_09: {required: srv.q9 + " is Required."},
                    survey_10: {required: srv.q10 + " is Required."},

                    // Custom Chosen Dropdown Validation
                    survey_01_check: {required: srv.q1 + " is Required."},
                    survey_02_check: {required: srv.q2 + " is Required."},
                    survey_03_check: {required: srv.q3 + " is Required."},
                    survey_04_check: {required: srv.q4 + " is Required."},
                    survey_05_check: {required: srv.q5 + " is Required."},
                    survey_06_check: {required: srv.q6 + " is Required."},
                    survey_07_check: {required: srv.q7 + " is Required."},
                    survey_08_check: {required: srv.q8 + " is Required."},
                    survey_09_check: {required: srv.q9 + " is Required."},
                    survey_10_check: {required: srv.q10 + " is Required."}
               },

               //error event
               invalidHandler: function (event, validator) {
                    var er = validator.numberOfInvalids(),
                         message = (er === 1) ? 'Sorry, But You Missed a Field.' : 'Sorry, But You Missed Some Fields.';

                    if (er) {
                         if (!agt.ios) {
                              //message = message + '';
                              
                              // Display Error Message, then Remove it after 5 seconds, Load Modal if user clicks it
                              if ($('#error').length !== 1) {
                                   $('form').append('<div id="error">' + message + '</div>');
                              } else {$("#error").html(message).show(); }
                              
                              TweenMax.killTweensOf($("#error"));
                              TweenMax.to($("#error"), 0.5, {opacity: 1, top: '0px', ease: "Power2.easeOut"});
                              
                              setTimeout(function () {
                                   TweenMax.killTweensOf($("#error"));
                                   TweenMax.to($("#error"), 0.5, {opacity: 0, top: '30px', ease: "Power2.easeOut"}, 5);
                              }, 5000);
                              setTimeout(function () {$('#error').hide(); }, 5510);

                              $('#errorbox ul').html('');
                              
                              //purgeOptions($('#errorbox ul'));
                              $.each(validator.errorMap, function (a, b) {
                                   $('#errorbox ul').append('<li>' + b + '</li>');
                              });

                              $(document).on('click', '#error', function (e) {
                                   $('#validatorModal').modal('show');
                              });
                         } else {
                              alert(message);
                              setTimeout(function () {window.scrollTo(0, 95); }, 0);
                         }
                    }

                    $('select option[value=""]:selected').parent().addClass('error');
                    if ($('select[multiple]').val() === null) {
                         $('select[multiple]').addClass('error');
                    } else {$('select[multiple]').removeClass('error'); }
               }
          });
          
          $('form').submit(function () {
               //success event
               if ($('form').valid()) {
                    $('#loadscreen').show();
                    TweenMax.to($('#loadscreen'), 1.2, {css: {top: '0'}, ease: "Circ.easeOut"});
               }
          });

          //Clean and Store All User Input
          $('form input[type="text"]').blur(function () {
               $('form').find('input').each(function () {
                    if ($(this).attr('name')) {
                         if ($(this).attr('type') === 'text') {
                              $(this).val($.trim($(this).val()));
                         }
                         sLS($(this).attr('name'), $(this).val());
                    }
               });

               $('form').find('select').each(function () {
                    if ($(this).attr('name')) {
                         sLS($(this).attr('name'), $(this).val());
                    }
               });
          });

          initControls();
          //dependentPicklist();
     }
     formValidation();


//Browser Event Watching
     //resize event and timers to capture the moment a user stops resizing
     function stoppedResize() {
          clearTimeout(stopResize);
          stopResize = setTimeout(function () {resized(); }, 100);
     }


     $(window).on({
          orientationchange: function () {stoppedResize(); },
          resize: function () {stoppedResize(); }
     });

     $('[name=EmailAddress]').on('keyup', function () {$('[name=SubscriberKey]').val($(this).val()); });
     $('[name=EmailAddress]').on('blur', function () {$('[name=SubscriberKey]').val($(this).val()); });
     $('#formJumper').on('click', function () {$('form input').first().select(); });

     loadApp();
     stoppedResize();
     $('label[for=candidate_specialty_check]').remove();
}