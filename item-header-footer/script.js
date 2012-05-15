// ==UserScript==
// @name			Item Header/Footer for Envato marketplaces
// @creator			dtbaker@gmail.com
// @namespace		dtbaker.com.au
// @description		Allows easy header/footer additions to all users items. Initially based off the Statementer by revaxarts :)
// @date			2012-05-13
// @version			1.0
// @include			http://activeden.net/user/*/portfolio
// @include			http://activeden.net/item/*
// @include			http://audiojungle.net/user/*/portfolio
// @include			http://audiojungle.net/item/*
// @include			http://themeforest.net/user/*/portfolio
// @include			http://themeforest.net/item/*
// @include			http://videohive.net/user/*/portfolio
// @include			http://videohive.net/item/*
// @include			http://graphicriver.net/user/*/portfolio
// @include			http://graphicriver.net/item/*
// @include			http://3docean.net/user/user/*/portfolio
// @include			http://3docean.net/item/*
// @include			http://codecanyon.net/user/*/portfolio
// @include			http://codecanyon.net/item/*
// @include			http://marketplace.tutsplus.com/user/*/portfolio
// @include			http://marketplace.tutsplus.com/item/
// @include			http://photodune.net/user/*/portfolio
// @include			http://photodune.net/item/*
// ==/UserScript==

(function () {



    function item_header_footer(){


        var mass_edit = {

            my_items: [],
            edit_index: -1,
            default_header: null,
            default_footer: null,

            init: function(){

                this.load_defaults();

                switch(this.check_page_type()){
                    case 'portfolio':
                        this.load_my_items();
                        if(this.my_items.length > 0){
                            this.load_main_ui();
                        }
                        break;
                    case 'item_edit':
                        if(this.mode() == 'editing'){
                            this.load_edit_ui();
                        }
                        break;
                    case 'item_view':
                        if(this.mode() == 'editing'){
                            // look for the message box taht says "edit success"
                            $('.notice.flash p').append(' <br/><br/><a href="#" id="mass_next_after" style="font-weight: bold;">CLICK HERE TO EDIT YOUR NEXT ITEM</a>');
                            $('#mass_next_after').bind('click', function () {
                                this.edit_next();
                            });
                            //this.edit_next();
                        }
                        break;

                }
            },
            load_defaults: function(){
                this.default_header = localStorage.getItem('envato_item_header');
                this.default_footer = localStorage.getItem('envato_item_footer');
                this.my_items = JSON.parse(localStorage.getItem('envato_item_my_items2'));
            },
            save_defaults: function(){
                localStorage.setItem('envato_item_header',this.default_header);
                localStorage.setItem('envato_item_footer',this.default_footer);
                localStorage.setItem('envato_item_my_items2',JSON.stringify(this.my_items));
            },
            mode: function(set){
                if(typeof set != 'undefined'){
                    localStorage.setItem('envato_item_mode',set);
                }else{
                    return localStorage.getItem('envato_item_mode');
                }
            },
            check_page_type: function(){
                if(location.href.match(/\/edit\/(\d+)/))return 'item_edit';
                else if(location.href.match(/(\w+)\/portfolio/))return 'portfolio';
                else if(location.href.match(/\/item\/.*\/\d+/))return 'item_view';

            },
            load_my_items: function(){
                var t=this;

                t.my_items = [];

                // there should be a <ul class="item-list">
                // and within each <li> there should be an "edit" link

                // loop over all items on this page and create our little list
                // if there is no items then we assume we're looking at some other users portfolio
                // and we don't do anything :)
                $('ul.item-list li').each(function(){

                    // find the edit link for this item.
                    var edit_link = false;
                    $('a',this).each(function(){
                        if($(this).html() == 'Edit'){
                            edit_link = this;
                        }
                    });
                    if(edit_link){
                        // find item id from link.
                        var item_id = edit_link.href.match(/\d+$/);
                        //console.log("Item header/footer: "+item_id[0]);

                        t.my_items.push(
                            {
                                'item_id': item_id[0],
                                'edit_link': edit_link.href,
                                'item_name': $('h3 a',this).text()
                            }
                        );
                    }
                });
                //console.debug(t.my_items);
            },
            do_replace: function(h){

                var preview_url = window.location.href.replace(/\/edit\//g,'/full_screen_preview/');
                h = h.replace(/"full_screen_preview"/g,'"'+preview_url+'"');

                return h;
            },
            load_edit_ui: function(){
                var t=this;

                var d = $('#description').val();
                if(t.default_header){
                    // search for existing header div.
                    // replace content.
                    var html = t.do_replace(t.default_header);

                    d = d.replace(/<div id="header">(.|\r|\n)*?<\/div>\n/g,'');
                    d = '<div id="header">'+html+'</div>'+"\n" + d;
                }
                if(t.default_footer){
                    // search for existing header div.
                    // replace content.
                    var html = t.do_replace(t.default_footer);
                    //d = d.replace(/<div id="footer">.*<\/div>/g,'');
                    d = d.replace(/<div id="footer">(.|\r|\n)*?<\/div>/g,'');
                    d = d + "\n"+'<div id="footer">'+html+'</div>';
                }
                $('#description').val(d);


                var $content = $('<div>', {
                    id: 'item_header_footer'
                }).prependTo('#content .content-l');

                $content.html('<span style="font-style:italic">loading...</span>');

                var html = '';

                html += '<div id="item_header_footer_container">';


                html += '<h2 class="box-heading">Mass Item Edit</h2><div class="content-box" style="margin: 0 0 20px 0;">';

                html += "<p>The default header and footer has been applied to this item description. Please confirm your item description and press Save Changes when you are ready.</p>";
                html += "<p>Please <a href='#' id='mass_next'>click here</a> if you wish to skip this item and move onto the next one (ie: don't save header/footer).  <a href='#' id='mass_cancel'>Cancel mass update</a></p>";

                html += '</div>'; //content box
                html += '</div>'; //item_header_footer_container

                $content.hide().html(html).fadeIn();


                $('#mass_next').bind('click', function () {
                    t.edit_next();
                });
                $('#mass_cancel').bind('click', function () {
                    t.cancel();
                });

            },
            load_main_ui: function(){
                var t=this;

                var $content = $('<div>', {
                    id: 'item_header_footer'
                }).prependTo('#content .content-l');

                $content.html('<span style="font-style:italic">loading...</span>');

                var html = '';

                html += '<div id="item_header_footer_container">';


                html += '<h2 class="box-heading">Mass Item Edit</h2><div class="content-box" style="margin: 0 0 20px 0;">';

                html += '<div style="float:left; padding: 5px;">';
                html += 'Default Header Code:<br/>';
                html += '<textarea name="item-header" id="item-header" style="width:350px">'+(t.default_header?t.default_header:'')+'</textarea>';
                html += '</div>';
                html += '<div style="float:left; padding: 5px;">';
                html += 'Default Footer Code:<br/>';
                html += '<textarea name="item-footer" id="item-footer" style="width:350px">'+(t.default_footer?t.default_footer:'')+'</textarea>';
                html += '</div>';
                html += '<div style="clear:both;">';
                html += '<button class="btn-icon upload" name="item-apply upload">Start Applying to '+t.my_items.length+' items below</button>';
                html += '</div>';

                html += '</div>'; //content box
                html += '</div>'; //item_header_footer_container

                $content.hide().html(html).fadeIn();

                $('#item_header_footer_container button').bind('click', function () {
                    t.default_header = $('#item-header').val();
                    t.default_footer = $('#item-footer').val();
                    t.save_defaults();
                    // start our loop!
                    t.mode('editing');
                    t.edit_next();
                });


            },
            edit_next: function(i){
                var t = this;
                if(typeof i !='undefined'){
                    t.edit_index = i;
                }else{
                    // if we are on an item page or an item edit page we find out what the "current" index in our array is.
                    switch(t.check_page_type()){
                        case 'item_edit':
                        case 'item_view':
                            var item_id = window.location.href.match(/\/(\d+)$/);
//                            console.debug(item_id);
//                            console.debug(t.my_items);
//                            return;
                            for(var x = 0;x< t.my_items.length;x++){
                                if(t.my_items[x].item_id == item_id[1]){
                                    t.edit_index = x;
                                    break;
                                }
                            }
                            break;
                    }
                    t.edit_index++;
                }
                if(typeof t.my_items[t.edit_index] != 'undefined'){
                    window.location.href= t.my_items[t.edit_index].edit_link;
                }else{
                    t.cancel();
                }
            },
            cancel: function(){
                this.mode('done');
                alert('All done! Please refresh.');
                //window.location.href='http://themeforest.net'; // todo - redirect to their portfolio page.
            }
        };

        mass_edit.init();
    }

	var inject = document.createElement("script");

	inject.setAttribute("type", "text/javascript");
	inject.appendChild(document.createTextNode("(" + item_header_footer + ")()"));

	(document.head || document.documentElement).appendChild(inject);


})();