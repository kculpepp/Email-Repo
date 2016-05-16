/*global $, jQuery, requestAnimationFrame, whatAgent,
 Modernizr, TweenMax, urlObject, console, alert */
/*==================================================
=            Copyright CompHealth 2015             =
=                Application Start                 =
==================================================*/
var timeonsite = 1; //used to calculate time on site, needs to be global

function app() {
    "use strict";
    var sR, //scroll function
        wX = $(window).width(), //window width
        wY = $(window).height(), //window height
        dX = $("html").width(), //document width
        dY = $("html").height(), //document height
        mX,
        mY,
        mXP,
        mYP,
        sP = 0,     //scroll percent
        sF = $(window).scrollTop(), //fixed scroll value in px
        flg = {},   //flag object - store true/false logic in here
        rD = $("html"), //makes scroll function easier
        rW = $(window), //makes scroll function easier
        stopResize, //helps js know when user stops resizing
        hash = window.location.hash.substr(1) || false, //current hash from url
        srv = {},   //holds survey field names
        agt = whatAgent(), //stores logic related to user agent string
        svars = {}, //stores variables for the scroll function
        ls = {},    //stores local storage config options
        url = urlObject();

    agt.ie8 = ($('.ie8').length === 1) ? true : false; //uses conditional logic and element on page, ie8 requires '=== 1' to be true
    agt.ie9 = $('.ie').length === 1 ? true : false; //uses conditional logic and element on page
    flg.form = $('form').length ? $('form') : false;
    flg.layout = $('#fixed').length ? 'fluid' : 'fixed'; //fluid layout has a container tag for the header logo
    flg.specDisabled = true;
    flg.choosen = (agt.ios) ? false : true; //allows future additions to logic with minimal changes
    flg.rh = false; //used for 991px or less reseting height attributes
    flg.IE8done = false;
    flg.stickymenu = false;
    flg.dev = $('#development').length ? true : false;
    svars.compatible = ((!agt.ie8 && !agt.ios) && (wX > 991 && wY > 400)) ? true : false;
    ls.timeStore = (3600000); //store local data for an hour
    ls.enabled = $.jStorage ? true : false;

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



    if(url.parameters.source === "et-LOC952-ProvNewsletter-150528") {
	redirect('http://www.comphealth.com/resources/?source=et-LOC952-ProvNewsletter-150528');
    }


    //Random Number Generator
    function getRandom(min, max) {return Math.floor(Math.random() * (max - min + 1) + min); }

    //String Helpers
    function trim(s) {return jQuery.trim(s); }
    function toProperCase(s) {if (s) {return s.toLowerCase().replace(/^(\S)|\s(\S)/g, function ($1) {return $1.toUpperCase(); }); } }
    function toTitleCase(s) {if (s) {return s.replace(/\w\S*/g, function (t) {return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase(); }); } }
    function hasWhiteSpace(s) {if (s) {return s.indexOf(' ') >= 0; } }

    //Logical helpers
    function hasValidValue(v) {if (v) {return true; } return false; }

    //Boxed Version Code
    function getHeight() {
        var a = $('.form-container').innerHeight(),
            b = $('.copy-container').innerHeight(),
            c = $('.container .row ~ .row').innerHeight();

        //Harmful for mobile
        if ($('html').width() < 991 || agt.iphone || agt.ie8 || (a === c && b === c)) {return false; }

        //Only useful for boxed layout
        if (flg.layout === "fluid") {return false; }

        //Set height if not correct
        if (a < c || b < c) {$('.form-container, .copy-container').height(c); }
    }
    function resetHeight() {
        //Only useful for boxed layout
        if ($(flg.layout).length) {return false; }

        //Remove JS set height val
        $('.form-container').removeAttr('style');
        $('.copy-container').removeAttr('style');

        //Recalculate and set JS height Val
        return getHeight();
    }

    //Scroll Events
    //Evaluates very often, keep it lightweight!
    function scroll(s, p, mx, my) {
        if (svars.compatible) {

            console.log(s, p, mx, my);
            
            if (wX < 700) {return;}
            //$('#lp-bubble').attr('style', 'left:' + (mx / 60) + 'px;top:' + (my / 15) + 'px;');
	      $('#lp-bubble').attr('style', 'top:' + (my / 15) + 'px');
            //$('#ad-slider').attr('style', 'left:' + (-mx / 17) + 'px;top:' + (-my / 17) + 'px;');
            //$('#lp-container').attr('style', 'left:' + (-mx / 24) + 'px;top:' + (-my / 24) + 'px;');
            //getHeight();
        }
    }

//Resize Events
    //Resize Stop Event, tasks that adjust after a resize only
    function resized() {
        var w, mw;
        //console.log(wX, wY);

        if (!agt.ios) {
            $('input[type=text],.chosen-container').attr('style', 'width:100%');
        }

        if (wX < 991) {
            if (!flg.rh) {
                resetHeight();
                flg.rh = true;
            }
        } else {
            if (flg.rh) {flg.rh = false; }
        }
    }

//Picklist
    //LP Dependent PickList Code
    function removeDisability(e) {e.removeAttr('disabled'); return false; }
    function purgeOptions(e) {e.children().remove(); }
    function safeString(s) {if (s) {return s.replace(/ /g, ''); } }

    //Pull all specialties
    function allSpecialties(obj, flag) {
        var str;
        flag = (flag) ? 'Referral' : 'Your';
        str = '<option value="" selected="selected">' + flag + ' Specialty *</option>';
        str = str + $('[name=xmlSpecialty]').html();
        $(obj + ' > option').remove();
        $(obj).append(str);
    }
    if ($('[name=referral_specialty]').length) {allSpecialties('[name=referral_specialty]', true); }

    function allProfessions(obj, flag) {
        var str;
        flag = (flag) ? 'Referral' : 'Your';
        str = '<option value="" selected="selected">' + flag + ' Profession *</option>';
        str = str + $('[name=xmlSpecialty]').html();
        $(obj + ' > option').remove();
        $(obj).append(str);
    }
    if ($('[name=referral_profession]').length) {allProfessions('[name=referral_profession]', true); }

    //Pull specialty from profession selection
    function getSpecialty(s) {
        var store = [],
            name,
            slug,
            obj = $('[name=candidate_specialty]'),
            b = url.parameters.specialty || false,
            test = 0,
            q,
            x = $('#xmlMap a p[v=' + s + ']').children('d');

        //IE8 can't pull dependents, css3 selector support?
        if ($('.ie8').length === 1 && flg.form) {
            if (!flg.IE8done) {
                allSpecialties('[name=candidate_specialty]');
                if (flg.specDisabled) {flg.specDisabled = removeDisability(obj); }
                $('[name=candidate_specialty]').trigger('chosen:updated');
            }
            flg.IE8done = true;
            return;
        }

        //this function is pointless without this element
        if (!obj.length) {return; }

        if (flg.specDisabled) {flg.specDisabled = removeDisability(obj); }
        purgeOptions(obj);

        $.each(x, function (i, v) {
            name = $(v).attr('n');
            slug = $(v).attr('v');
            store[i] = "<option value=\"" + slug + "\">" + name + "</option>";
        });
        obj.append('<option value="">Select Your Specialty</option>' + store.join(""));

        //Testing setup
        if (!hasWhiteSpace(b) && hasValidValue(b)) {test = $('[name=candidate_specialty] option[value=' + b + ']').length; }

        //Update chosen plugin dropdown menu
        if (!agt.ios) {
            if (test) {obj.val(b); $('[name=candidate_specialty_check]').prop("checked", true); }

            $('[name=candidate_specialty]').trigger('chosen:updated');
        }
    }

//Custom Fields and Validations
    //Grab Proper Names for Validation Messages and Populate Hidden fields for labeling questions to list in ET
    function getSurveyName(obj) {
        var name, proper, label;
        if ($(obj).length) {
            name = $(obj).attr('name');
            proper = $(obj).attr('data-name');
            $(obj).attr('placeholder', proper);
            $(obj).before('<label for="' + name + '">' + proper + '</label>');
            label = "label_" + name.slice(-2);
            $('form').append('<input type="hidden" name="' + label + '" value="' + proper + '" />');
            return proper;
        }
    }

    //Custom Form Logic Definitions, called on load, triggered on input,select update
    function logic(value) {
        var l1 = $('.logic-1'),
            l2 = $('.logic-2'),
            c1,
            c2,
            c3;
        if (!value) {return; } else {value += ""; }
        c1 = value.indexOf('locum');
        c2 = value.indexOf('temporary');
        c3 = value.indexOf('none');
        console.info(value, c1, c2, c3);

        if (l1.length && (c1 > -1 || c2 > -1)) {
            l1.fadeIn(300).removeAttr('hidden').show();
            //$('[name=survey_02_check]').remove(); //removes faulty checkbox

            //if(!agt.ios){
            //    $('form').append('<input type="checkbox" class="offscreen" name="survey_02_check" value="true">'); //adds validation to checkbox
            //}
        }

        if (c3 < 0 && l2.length) {
            l2.fadeIn(300).removeAttr('hidden').show();
            //$('[name=survey_03_check]').remove(); //removes faulty checkbox
            //if(!agt.ios){
            //    $('form').append('<input type="checkbox" class="offscreen" name="survey_03_check" value="true">'); //adds validation to checkbox
            //}
        }

        resetHeight();
        resized();
    }

    //custom validation: obj: form field, cb: hidden checkbox, flag: specifies type
    function initDropdown(obj, cb, flag, callLogic) {
        if (agt.ios || !$(obj).length) {
            if (callLogic) {
                $(obj).on('change', function () {logic($(this).val()); });
            }
            return;
        }

        $('form').append('<input type="checkbox" class="offscreen" name="' + cb + '" value="true">');

        if (flag) {
            $(obj).attr('multiple', 'true');
            $(obj).chosen({search_contains: true}).change(function () {
                $(this).removeClass('error');
                resetHeight();
                resized();
                setTimeout(function () {getHeight(); }, 55);
                if (callLogic) {logic($(this).val()); }
            });
        } else {
            $(obj).chosen().change(function () {$(this).removeClass('error'); resetHeight(); resized(); if (callLogic) {logic($(this).val()); } });
        }

        $(obj).on('change', function () {
            $('[name=' + cb + ']').prop("checked", true);
            if (callLogic) {logic($(this).val()); }
        });
    }

    //adds error class if there happens to be an error
    function testDropdown(n, v) {
        if (!v) {v = null; }
        if ($(n).hasClass('error')) {return $(n + ' + .chosen-container').addClass('error'); }
        $(n + ' + .chosen-container').removeClass('error');
    }

    //Initialize chosen plugin, onchange events, and hidden checkboxes, Proper SurveyNames
    function initControls() {
        initDropdown("[name=candidate_profession]", "candidate_profession_check");
        initDropdown("[name=candidate_specialty]", "candidate_specialty_check");
        initDropdown("[name=candidate_jobtype]", "candidate_jobtype_check");
        initDropdown("[name=referral_profession]", "referral_profession_check");
        initDropdown("[name=referral_specialty]", "referral_specialty_check");

        //initDropdown("[name=survey_01]", "survey_01_check", true, true);
        //initDropdown("[name=survey_02]", "survey_02_check", true);
        //initDropdown("[name=survey_03]", "survey_03_check", true);
        //initDropdown("[name=survey_06]", "survey_06_check");

    }

    //Allows validator to show error class on chosen dropdowns
    function testChosen() {
        testDropdown("[name=candidate_profession]");
        testDropdown("[name=candidate_specialty]");
        testDropdown("[name=candidate_jobtype]");
        testDropdown("[name=referral_profession]");
        testDropdown("[name=referral_specialty]");
    }

    //Retrieves Professions and Populates Specialties
    function dependentPicklist() {
        var a = $('select[name=xmlProfession]').html(), //option list
            b = url.parameters.profession || false, //&profession=test
            obj = $('[name=candidate_profession]'),
            test = 0,
            safe = safeString(b); //spaces in attribute throw errors

        //function is pointless without profession field
        if (!obj.length) {return; }

        //populate professions and update plugin
        obj.append(a);
        if (!agt.ios) {obj.trigger('chosen:updated'); }

        //Apply URL Param if it exists
        if (!hasWhiteSpace(b) && hasValidValue(b)) {
            test = $('[name=candidate_profession] option[value=' + b + ']').length;
            if (test) {
                obj.val(safe);
                $('[name=candidate_profession_check]').prop("checked", true);
                getSpecialty(safe);
            }
        }
        obj.on('change', function () {getSpecialty($(this).val()); });
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
        } else {v[0] = 'Nothing Stored'; }


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

    //Set Custom Thank You Page to local storage
    function sTYLS() {
        //prevents errors
        if (!ls.enabled) {return; }
        if (url.pathname.indexOf("thank") > 0) {return; }

        sLS('ty-header', $('#thank-you-custom-text').data('header'));
        sLS('ty-body', $('#thank-you-custom-text').attr('data-body'));
        sLS('ty-url', $('#thank-you-custom-text').attr('data-url'));
        sLS('ty-cta', $('#thank-you-custom-text').attr('data-cta'));
        sLS('ty-phone', $('#thank-you-custom-text').attr('data-phone'));
        sLS('ty-phone-text', $('#thank-you-custom-text').attr('data-phone-text'));
        sLS('ty-alt-phone', $('#thank-you-custom-text').attr('data-alt-phone'));
        sLS('ty-alt-phone-text', $('#thank-you-custom-text').attr('data-alt-phone-text'));
    }

    //Get Custom Thank You Page to local storage
    function gTYLS() {
        var title, body, cta, ctaurl, phone, phonetext, altphone, altphonetext;

        //prevent errors and mishaps
        if (!ls.enabled) {return; }
        if (urlObject().pathname.indexOf("thank") < 0) {return; }
        title = $.jStorage.get('ty-header');
        body = $.jStorage.get('ty-body');
        cta = $.jStorage.get('ty-cta');
        ctaurl = $.jStorage.get('ty-url');
        phone = $.jStorage.get('ty-phone');
        phonetext = $.jStorage.get('ty-phone-text');
        altphone = $.jStorage.get('ty-alt-phone');
        altphonetext = $.jStorage.get('ty-alt-phone-text');
        if (title) {$('#thank-title').html(title); }
        if (body) {$('#thank-body').html(body); }
        if (cta) {$('#thank-cta').html(cta + '<img src="http://image.comphealthinfo.com/lib/ff041d70776404/m/1/CPH-CTA-Arrow.png" alt=">">'); }
        if (ctaurl) {$('#thank-cta').attr('href', ctaurl); }
        if (phone) {$('#thank-phone a').attr('href', 'tel://' + phone).html('<img src="http://image.comphealthinfo.com/lib/ff041d70776404/m/1/footer-icon-phone.png" alt="" width="32px" height="30px">' + phone); }
        if (phonetext) {$('#thank-phone p').html(phonetext); }
        if (altphone && altphonetext) {
            $('#thank-alt-phone a').attr('href', 'tel://' + altphone).html('<img src="http://image.comphealthinfo.com/lib/ff041d70776404/m/1/footer-icon-phone.png" alt="" width="32px" height="30px">' + altphone);
            $('#thank-phone p').html(altphonetext);
        }

        console.info(title, body, cta, ctaurl, phone, phonetext, altphone, altphonetext);
    }


    //Remove all Local Stored Variables and Wipe Form
    function resetForm() {
        if (ls.enabled) {$.jStorage.flush(); } //kill localstorage, if exists
        $('form').trigger("reset"); //kill all form values
        sTYLS(); //get custom Thankyou page vars
    }

    //Pull Params into Form Fields from URL
    function putParams() {
        if (!url.parameters) {sLS(); return; }
        if (url.parameters.fnm) {$('[name=candidate_first_name]').val(url.parameters.fnm); }
        if (url.parameters.lnm) {$('[name=candidate_last_name]').val(url.parameters.lnm); }
        if (url.parameters.phn) {$('[name=candidate_phone]').val(url.parameters.phn); }
        if (url.parameters.eml) {$('[name=EmailAddress]').val(url.parameters.eml); }
    }
    if (flg.form) {putParams(); }

    //Allow Analytics to see page title, but swap to a readable format before user notices
    function pageTitleChange() {
        if ($('h1').length) {document.title = $('h1:first').text(); } else if ($('h2').length) {document.title = $('h2:first').text(); } else if ($('h3').length) {document.title = $('h3:first').text(); } else {return; }
    }

    //Put Analytics into form field
    function putAnalytics() {
        var prop, hold = '';

        //check if field exists and create if does not exist
        if ($('[name=a_user_agent]').length !== 1) {hold += '<input name="a_user_agent" type="hidden">'; }
        if ($('[name=a_time_on_site]').length !== 1) {hold += '<input name="a_time_on_site" type="hidden">'; }
        if ($('[name=a_screen_res]').length !== 1) {hold += '<input name="a_screen_res" type="hidden">'; }
        if ($('[name=a_visited_before]').length !== 1) {hold += '<input name="a_visited_before" type="hidden">'; }
        if ($('[name=a_loaded_source]').length !== 1) {hold += '<input name="a_loaded_source" type="hidden">'; }
        if ($('[name=pagetype]').length !== 1) {hold += '<input name="pagetype" type="hidden" val="L">'; }
        if ($('[name=a_zip_code]').length !== 1) {hold += '<input name="a_zip_code" type="hidden" val="L">'; }
        $('form').append(hold);

        //specify that the visitor has been here before
        slLS("a_visited_before", "true");

        //get the current user agent
        for (prop in agt) {
            if (agt.hasOwnProperty(prop) && agt[prop]) {
                $('[name=a_user_agent]').val(prop);
            }
        }

        //place the current screen resolution
        $('[name=a_screen_res]').val(wX + 'x' + wY);

        if (!$('[name=a_loaded_source]').val()) {
            $('[name=a_loaded_source]').val(url.parameters.source || $('[name=cid]').val());
        }
    }

    //Put time on site into form field
    function timeOnSite() {
        timeonsite += 1;
        $('[name=a_time_on_site]').val(timeonsite);
    }

//Loader Bundle
    //Load Page and Features - Collection of Small Features
    function loadApp() {
        var temp;

        //Display Variables & Values, Development only!
        if (!flg.dev) {
            temp = '** JS Vars:\n************************************************';
            temp += '\nWindow (width:' + wX + ' height:' + wY + ')\nDocument (width:' + dX + ' height:' + dY + ')\nScroll (vertical %:' + sP + ' px:' + sF + ')\nLocalstorage Lifespan: ' + (ls.timeStore / 60000) + ' minutes\nURL Fragment: ' + hash + '\n************************************************';
            console.info(temp);
            iLS();
        }

        //Remove Load screen
        function hideLoadScreen() {$('#loadscreen').hide(); resetHeight(); }
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
        if (!Modernizr.svg || agt.ie8) {
            $('#header-logo').append('<img src="http://image.comphealthinfo.com/lib/ff041d70776404/m/1/comphealth-logo-230.png" alt="CompHealth" width="230" height="40" style="border:0;display:block;margin-top:25px;margin-bottom:25px" />');
            /*$('#footer-logo').append('<img src="http://image.comphealthinfo.com/lib/ff041d70776404/m/1/footer-logo-cph.png" alt="CompHealth" width="157" height="28" style="border:0;display:block;margin-top:25px;margin-bottom:25px" />');*/
        }

        //Support Design Choices
        if (flg.form && $('.chosen-choices').length) {$('.chosen-choices').addClass('shadow'); }

        //Human Friendly Titles
        setTimeout(function () {pageTitleChange(); }, 700);

        //Analytics
        putAnalytics();
        setInterval(function () {timeOnSite(); }, 1000);
        sTYLS();
        gTYLS();
        logic();
    }

//Form Validation
    function formValidation() {
        //Skips this block of code if the page has no form
        if (!flg.form) {return; }
        if (!$('#errorbox').length) {
            $('body').append('<div class="modal fade" id="validatorModal" tabindex="-1" role="dialog" aria-labelledby="validatorModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">Please ensure all fields have been filled out.</h4></div><div class="modal-body" id="errorbox"><h5>The Following Items Need to be Corrected:</h5><ul></ul></div><div class="modal-footer"><button type="button" class="btn btn-danger btn-sm" data-dismiss="modal">Close</button></div></div></div></div>');
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
                //survey_02: {required: true},
                //survey_03: {required: true},
                survey_04: {required: true},
                survey_05: {required: true},
                survey_06: {required: true},
                survey_07: {required: true},
                survey_08: {required: true},
                survey_09: {required: true},
                survey_10: {required: true},

                // Custom Chosen Dropdown Validation
                survey_01_check: {required: true},
                //survey_02_check: {required: true},
                //survey_03_check: {required: true},
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
                candidate_profession: {required: "Your Specialty is Required."},
                candidate_specialty: {required: "Your Profession is Required."},
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
                        message = message + ' <br><a class="btn btn-xs btn-orange" data-toggle="modal" data-target="#myModal" style="margin-top:10px">More Info <img src="http://image.comphealthinfo.com/lib/ff041d70776404/m/1/CPH-CTA-Arrow.png" class="arrow" /></a>';
                        //Chosen Errors
                        testChosen();

                        // Display Error Message, then Remove it after 5 seconds, Load Modal if user clicks it
                        if ($('#error').length !== 1) {
                            $('form').append('<div id="error" class="bg-danger">' + message + '</div>');
                        } else {$("#error").html(message).show(); }
                        resetHeight();
                        TweenMax.killTweensOf($("#error"));
                        TweenMax.to($("#error"), 0.5, {opacity: 1, top: '0px', ease: "Power2.easeOut"});
                        setTimeout(function () {getHeight(); }, 730);
                        setTimeout(function () {
                            TweenMax.killTweensOf($("#error"));
                            TweenMax.to($("#error"), 0.5, {opacity: 0, top: '30px', ease: "Power2.easeOut"}, 5);
                        }, 5000);
                        setTimeout(function () {resetHeight(); $('#error').hide(); }, 5510);

                        purgeOptions($('#errorbox ul'));
                        $.each(validator.errorMap, function (a, b) {
                            $('#errorbox ul').append('<li>' + b + '</li>');
                        });

                        $(document).on('click', '#error', function (e) {
                            $('#validatorModal').modal('show');
                        });
                    } else {
                        setTimeout(function () {alert(message); }, 300);
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

        //Title Case-ing - If needed
        /*
        if ($('input[name="city"]').length) {
            $('input[name="city"]').blur(function () {
                $(this).val(toProperCase($(this).val()));
            });
        }
        if ($('input[name="street"]').length) {
            $('input[name="street"]').blur(function () {
                $(this).val(toProperCase($(this).val()));
            });
        }*/

        /*
        function logForm() {
            var log = [], i, n, v, t, e = 0, set = $('form input, form select');

            for (i = 0; i < set.length - 1; i += 1) {
                n = set[i].name || false;
                v = set[i].value || false;
                t = set[i].type || false;
                if ((n.charAt(0) !== "_" || n.charAt(0) !== "a") && n && t !== "hidden") {
                    log[i - e] = n + ': ' + v;
                } else if (n === "_deExternalKey") {
                    log[i - e] = n + ': ' + v;
                } else {
                    log[i - e] = "";
                    e += 1;
                }
            }
            console.info('***********************************************\n ** Fields Shown:\n************************************************\n' + $.trim(log.join('\n')) + '\n************************************************');
        }
        logForm();*/

        initControls();
        dependentPicklist();
    }
    formValidation();


//Browser Event Watching
    //resize event and timers to capture the moment a user stops resizing
    function stoppedResize() {
        clearTimeout(stopResize);
        stopResize = setTimeout(function () {resized(); }, 100);
    }

    //sR uses request Animation Frame and calls the scroll function above
    sR = function (e) {
        wX = rW.width();
        wY = rW.height();
        dX = rD.width();
        dY = rD.height();
        sF = rW.scrollTop();
        mXP = Math.round(mX / wX * 100);
        mYP = Math.round(mY / wY * 100);
        sP = Math.round((sF / (dY - wY)) * 100);
        scroll(sF, sP, mXP, mYP);
    };
    $(window).on({
        orientationchange: function () {requestAnimationFrame(sR); },
        scroll: function () {requestAnimationFrame(sR); },
        resize: function () {requestAnimationFrame(sR); stoppedResize(); },
        mousemove: function (e) {
            mX = e.pageX; 
            mY = e.pageY;
            requestAnimationFrame(sR);
        }
    });

    loadApp();
    sR();
    stoppedResize();
}

jQuery(document).ready(function ($) { 
    $( ".expand-one" ).click(function() {
        
        event.preventDefault();
   
            $( ".content-one" ).slideToggle( "slow", function() {
  
               
});
   
});
    

   
});

